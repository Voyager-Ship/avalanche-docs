'use client';

import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { hexToBytes, bytesToHex, encodeFunctionData, Abi } from 'viem';
import { useWalletStore } from '@/components/toolbox/stores/walletStore';
import { useChainPublicClient } from '@/components/toolbox/hooks/useChainPublicClient';
import { useViemChainStore } from '@/components/toolbox/stores/toolboxStore';
import { useAvalancheSDKChainkit } from '@/components/toolbox/stores/useAvalancheSDKChainkit';
import { useResolvedWalletClient } from '@/components/toolbox/hooks/useResolvedWalletClient';
import { useNativeTokenStakingManager, useERC20TokenStakingManager } from '@/components/toolbox/hooks/contracts';
import useConsoleNotifications from '@/hooks/useConsoleNotifications';
import { Button } from '@/components/toolbox/components/Button';
import { Input } from '@/components/toolbox/components/Input';
import { Alert } from '@/components/toolbox/components/Alert';
import { CoreWalletTransactionButton } from '@/components/toolbox/components/CoreWalletTransactionButton';
import { StepFlowCard } from '@/components/toolbox/components/StepCard';
import { CliAlternative } from '@/components/console/cli-alternative';
import { packL1ValidatorWeightMessage } from '@/components/toolbox/coreViem/utils/convertWarp';
import { packWarpIntoAccessList } from '@/components/toolbox/console/permissioned-l1s/validator-manager/packWarp';
import { generateCastSendCommand } from '@/components/toolbox/utils/castCommand';
import NativeTokenStakingManager from '@/contracts/icm-contracts/compiled/NativeTokenStakingManager.json';
import ERC20TokenStakingManager from '@/contracts/icm-contracts/compiled/ERC20TokenStakingManager.json';

type TokenType = 'native' | 'erc20';

// The completeValidatorRemoval call always passes warp message index 0 — P-Chain
// emits exactly one warp per SetL1ValidatorWeight tx and we sign that single
// message. Exposing this as an editable input was dead UX that confused users.
const WARP_MESSAGE_INDEX = 0;

interface CompleteValidatorRemovalProps {
  validationID?: string;
  stakingManagerAddress: string;
  tokenType: TokenType;
  subnetIdL1: string;
  signingSubnetId?: string;
  pChainTxId?: string;
  onSuccess: (data: { txHash: string; message: string }) => void;
  onError: (message: string) => void;
}

interface ExtractedWeightMessage {
  validationID: string;
  nonce: bigint;
  weight: bigint;
}

/**
 * PoS Complete Validator Removal — mirrors the SubmitPChainTxWeightUpdate
 * UX with three StepFlowCards (Extract → Aggregate → Submit) so the user
 * can retry signature aggregation independently of submitting the on-chain
 * tx. Critical when the L1's signing subnet has churned between aggregator
 * snapshot and verification snapshot and you need multiple aggregation
 * attempts before P-Chain accepts the message.
 */
const CompleteValidatorRemoval: React.FC<CompleteValidatorRemovalProps> = ({
  validationID,
  stakingManagerAddress,
  tokenType,
  subnetIdL1,
  signingSubnetId,
  pChainTxId: initialPChainTxId,
  onSuccess,
  onError,
}) => {
  const { avalancheNetworkID } = useWalletStore();
  const chainPublicClient = useChainPublicClient();
  const walletClient = useResolvedWalletClient();
  const viemChain = useViemChainStore();
  const { aggregateSignature } = useAvalancheSDKChainkit();
  const { notify } = useConsoleNotifications();

  const nativeStakingManager = useNativeTokenStakingManager(tokenType === 'native' ? stakingManagerAddress : null);
  const erc20StakingManager = useERC20TokenStakingManager(tokenType === 'erc20' ? stakingManagerAddress : null);

  const [pChainTxId, setPChainTxId] = useState<string>(initialPChainTxId || '');
  const [extracted, setExtracted] = useState<ExtractedWeightMessage | null>(null);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  const [signedWarpMessage, setSignedWarpMessage] = useState<string | null>(null);
  const [isAggregating, setIsAggregating] = useState(false);

  const [txHash, setTxHash] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setLocalError] = useState<string | null>(null);

  // Sync external pChainTxId prop.
  useEffect(() => {
    if (initialPChainTxId && initialPChainTxId !== pChainTxId) {
      setPChainTxId(initialPChainTxId);
    }
  }, [initialPChainTxId]);

  // Auto-extract weight message when P-Chain tx ID changes. Mirrors the
  // auto-extract behavior of SubmitPChainTxWeightUpdate's step 1 — Core wallet
  // makes a P-Chain RPC call and returns the embedded SetL1ValidatorWeightMessage.
  useEffect(() => {
    let cancelled = false;
    const tx = pChainTxId.trim();
    if (!tx) {
      setExtracted(null);
      setExtractError(null);
      setSignedWarpMessage(null);
      return;
    }

    setIsExtracting(true);
    setExtractError(null);
    setSignedWarpMessage(null);

    (async () => {
      try {
        const coreWalletClient = useWalletStore.getState().coreWalletClient;
        if (!coreWalletClient) {
          throw new Error('Core Wallet is required to read the P-Chain transaction.');
        }
        const weightMessageData = await coreWalletClient.extractL1ValidatorWeightMessage({ txId: tx });
        if (cancelled) return;
        setExtracted({
          validationID: weightMessageData.validationID,
          nonce: weightMessageData.nonce,
          weight: weightMessageData.weight,
        });
      } catch (err: any) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : String(err);
        setExtractError(msg);
        setExtracted(null);
      } finally {
        if (!cancelled) setIsExtracting(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pChainTxId]);

  const handleAggregate = async () => {
    setLocalError(null);

    if (!extracted) {
      const msg = 'No weight message extracted — paste a valid P-Chain transaction ID first.';
      setLocalError(msg);
      onError(msg);
      return;
    }

    setIsAggregating(true);
    try {
      const validationIDBytes = hexToBytes(extracted.validationID as `0x${string}`);
      const l1WeightMsg = packL1ValidatorWeightMessage(
        { validationID: validationIDBytes, nonce: extracted.nonce, weight: extracted.weight },
        avalancheNetworkID,
        '11111111111111111111111111111111LpoYY',
      );

      const aggregateSignaturePromise = aggregateSignature({
        message: bytesToHex(l1WeightMsg),
        signingSubnetId: signingSubnetId || subnetIdL1,
      });

      notify({ type: 'local', name: 'Aggregate P-Chain Signatures' }, aggregateSignaturePromise);

      const { signedMessage } = await aggregateSignaturePromise;
      setSignedWarpMessage(signedMessage);
    } catch (err: any) {
      const message = err instanceof Error ? err.message : String(err);
      setLocalError(`Signature aggregation failed: ${message}`);
      onError(`Signature aggregation failed: ${message}`);
    } finally {
      setIsAggregating(false);
    }
  };

  const handleSubmit = async () => {
    setLocalError(null);

    if (!signedWarpMessage) {
      const msg = 'No signed warp message — aggregate signatures first.';
      setLocalError(msg);
      onError(msg);
      return;
    }
    if (!walletClient || !chainPublicClient || !viemChain) {
      const msg = 'Wallet or chain configuration is not properly initialized.';
      setLocalError(msg);
      onError(msg);
      return;
    }

    setIsSubmitting(true);
    try {
      const signedWarpBytes = hexToBytes(`0x${signedWarpMessage}`);
      const accessList = packWarpIntoAccessList(signedWarpBytes);

      const hash =
        tokenType === 'native'
          ? await nativeStakingManager.completeValidatorRemoval(WARP_MESSAGE_INDEX, accessList)
          : await erc20StakingManager.completeValidatorRemoval(WARP_MESSAGE_INDEX, accessList);

      setTxHash(hash);
      const receipt = await chainPublicClient.waitForTransactionReceipt({ hash: hash as `0x${string}` });
      if (receipt.status !== 'success') {
        throw new Error(`Transaction failed with status: ${receipt.status}`);
      }

      const hasRemovalEvent = receipt.logs.some(
        (log) => log.topics[0]?.toLowerCase().includes('removal') || log.topics[0]?.toLowerCase().includes('complete'),
      );
      const successMsg = hasRemovalEvent
        ? 'Validator removal completed and rewards distributed successfully.'
        : 'Validator removal completed successfully.';

      onSuccess({ txHash: hash, message: successMsg });
    } catch (err: any) {
      let message = err instanceof Error ? err.message : String(err);
      if (message.includes('User rejected')) {
        message = 'Transaction was rejected by user';
      } else if (message.includes('InvalidValidationID')) {
        message = 'Invalid validation ID. The validator may not exist or removal was not initiated.';
      } else if (message.includes('ValidatorNotRemovable')) {
        message = 'Validator cannot be removed yet. Ensure you have initiated removal first.';
      } else if (message.includes('InvalidValidatorStatus')) {
        message = 'Validator is not in the correct status for completion. Check if removal was initiated.';
      } else if (message.includes('InvalidNonce')) {
        message = 'Invalid nonce. The P-Chain transaction may be outdated or incorrect.';
      }
      setLocalError(`Failed to complete validator removal: ${message}`);
      onError(`Failed to complete validator removal: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  function generateCastCommand(): string {
    if (!signedWarpMessage) return '';
    const rpcUrl = viemChain?.rpcUrls?.default?.http?.[0] || '<L1_RPC_URL>';
    const addr = stakingManagerAddress || '<STAKING_MANAGER_ADDRESS>';
    const abi = tokenType === 'native' ? NativeTokenStakingManager.abi : ERC20TokenStakingManager.abi;
    const signedWarpBytes = hexToBytes(`0x${signedWarpMessage}`);
    const accessList = packWarpIntoAccessList(signedWarpBytes);
    const calldata = encodeFunctionData({
      abi: abi as Abi,
      functionName: 'completeValidatorRemoval',
      args: [WARP_MESSAGE_INDEX],
    });
    return generateCastSendCommand({ address: addr, calldata, accessList, rpcUrl });
  }

  const step1Complete = !!extracted && !extractError;
  const step2Complete = !!signedWarpMessage;
  const step3Complete = !!txHash;

  return (
    <div className="space-y-3">
      {error && <Alert variant="error">{error}</Alert>}

      {/* Step 1 — P-Chain Transaction (auto-extract on input change) */}
      <StepFlowCard
        step={1}
        title="P-Chain Transaction"
        description="Read the SetL1ValidatorWeight message from the P-Chain transaction"
        isComplete={step1Complete}
      >
        <div className="mt-2 space-y-2">
          {validationID && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              <span className="font-medium">Validation ID:</span>{' '}
              <code className="font-mono">{validationID}</code>
            </p>
          )}
          <Input
            label="P-Chain Transaction ID"
            value={pChainTxId}
            onChange={setPChainTxId}
            placeholder="Enter the P-Chain transaction ID from the previous step"
            disabled={isAggregating || isSubmitting || !!txHash}
            helperText="The transaction ID from the P-Chain weight update step"
          />
          {isExtracting && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 animate-pulse">Reading P-Chain transaction…</p>
          )}
          {extractError && <Alert variant="error">{extractError}</Alert>}
          {extracted && (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                <Check className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">Weight message extracted</span>
              </div>
              <div className="text-[11px] text-zinc-600 dark:text-zinc-400 space-y-0.5 ml-5">
                <p>
                  <span className="font-medium">Nonce:</span> {extracted.nonce.toString()}
                </p>
                <p>
                  <span className="font-medium">Weight:</span> {extracted.weight.toString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </StepFlowCard>

      {/* Step 2 — Aggregate signatures */}
      <StepFlowCard
        step={2}
        title="Aggregate Signatures"
        description="Collect BLS signatures from the L1's signing subnet (67% quorum)"
        isComplete={step2Complete}
        isActive={step1Complete && !step2Complete}
      >
        {step2Complete && !step3Complete && (
          <div className="mt-2 space-y-2">
            <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
              <Check className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Signatures aggregated</span>
            </div>
            <button
              type="button"
              onClick={handleAggregate}
              disabled={isAggregating || isSubmitting}
              className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
            >
              Re-aggregate signatures
            </button>
          </div>
        )}
        {!step2Complete && step1Complete && !step3Complete && (
          <div className="mt-2">
            <Button
              onClick={handleAggregate}
              disabled={isAggregating || !extracted}
              loading={isAggregating}
              className="w-full"
            >
              {isAggregating ? 'Aggregating signatures…' : 'Aggregate Signatures'}
            </Button>
          </div>
        )}
      </StepFlowCard>

      {/* Step 3 — Submit to L1 */}
      <StepFlowCard
        step={3}
        title="Submit to L1"
        description="Call completeValidatorRemoval on the Staking Manager"
        isComplete={step3Complete}
        isActive={step2Complete && !step3Complete}
      >
        {step3Complete && txHash && (
          <div className="mt-2 flex items-center gap-1.5 text-green-600 dark:text-green-400">
            <Check className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">
              Removal complete:{' '}
              <code className="font-mono text-[11px] bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded">
                {txHash}
              </code>
            </span>
          </div>
        )}
        {!step3Complete && step2Complete && (
          <div className="mt-2">
            <CoreWalletTransactionButton
              onClick={handleSubmit}
              loading={isSubmitting}
              loadingText="Submitting…"
              disabled={isSubmitting || !signedWarpMessage}
              className="w-full"
            >
              Complete Removal & Distribute Rewards
            </CoreWalletTransactionButton>
            {/* CLI alternative — useful when the user can't or doesn't want
                to submit through the connected wallet (Frame/Ledger/etc). */}
            <div className="mt-3">
              <CliAlternative command={generateCastCommand()} />
            </div>
          </div>
        )}
      </StepFlowCard>

      <Alert variant="info">
        <p className="text-sm font-medium">What happens when you complete removal:</p>
        <ul className="list-disc list-inside text-sm mt-2 space-y-1">
          <li>Validator stake will be returned</li>
          <li>Rewards will be calculated and distributed based on uptime</li>
          <li>If applicable, delegation fees will become claimable</li>
          <li>Validator will be removed from the active set</li>
        </ul>
      </Alert>
    </div>
  );
};

export default CompleteValidatorRemoval;
