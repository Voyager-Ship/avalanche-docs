'use client';

import React, { useMemo, useState } from 'react';
import { Alert } from '@/components/toolbox/components/Alert';
import { Button } from '@/components/toolbox/components/Button';
import SelectValidationID from '@/components/toolbox/components/SelectValidationID';
import { useRemoveValidatorStore } from '@/components/toolbox/stores/removeValidatorStore';
import { useValidatorManagerContext } from '@/components/toolbox/contexts/ValidatorManagerContext';
import { useViemChainStore } from '@/components/toolbox/stores/toolboxStore';
import PoAInitiateValidatorRemoval from '@/components/toolbox/console/permissioned-l1s/remove-validator/InitiateValidatorRemoval';
import StakingInitiateValidatorRemoval from '@/components/toolbox/console/permissionless-l1s/withdraw/InitiateValidatorRemoval';
import StakingInitiateValidatorRemovalUptime from '@/components/toolbox/console/permissionless-l1s/withdraw/InitiateValidatorRemovalUptime';
import { StepCodeViewer } from '@/components/console/step-code-viewer';
import { ManagerTypeBadge } from '@/components/toolbox/console/add-validator/ManagerTypeBadge';
import { VmcChainSwitchBanner } from '@/components/toolbox/console/add-validator/VmcChainSwitchBanner';
import { buildStepConfig, type ManagerCodeFlavor } from '../codeConfig';
import versions from '@/scripts/versions.json';

const ICM_COMMIT = versions['ava-labs/icm-services'];

function flavorFor(
  ownerType: ReturnType<typeof useValidatorManagerContext>['ownerType'],
  stakingType: ReturnType<typeof useValidatorManagerContext>['staking']['stakingType'],
): ManagerCodeFlavor {
  if (ownerType === 'StakingManager' && stakingType === 'native') return 'PoS-Native';
  if (ownerType === 'StakingManager' && stakingType === 'erc20') return 'PoS-ERC20';
  return 'PoA';
}

export default function InitiateRemovalStep() {
  const store = useRemoveValidatorStore();
  const vmcCtx = useValidatorManagerContext();
  const viemChain = useViemChainStore();

  const isDetecting =
    !!vmcCtx.chainMismatch ||
    vmcCtx.isDetectingOwnerType ||
    vmcCtx.isLoadingOwnership ||
    (vmcCtx.ownerType === 'StakingManager' && vmcCtx.staking.isLoading);
  const flavor = useMemo(() => flavorFor(vmcCtx.ownerType, vmcCtx.staking.stakingType), [
    vmcCtx.ownerType,
    vmcCtx.staking.stakingType,
  ]);
  const stepConfig = useMemo(() => buildStepConfig(flavor), [flavor]);
  const isStaking = flavor !== 'PoA';

  // For PoS: start in 'uptime' mode (preserves rewards). If the contract reverts
  // with ValidatorIneligibleForRewards, we surface a "Force remove (forfeit
  // rewards)" button that flips this to 'force', which renders the
  // forceInitiateValidatorRemoval variant instead. PoA always uses one path.
  const [posMode, setPosMode] = useState<'uptime' | 'force'>('uptime');
  const [ineligibleForRewards, setIneligibleForRewards] = useState(false);

  const stakingManagerAddress = vmcCtx.staking.stakingManagerAddress || vmcCtx.validatorManagerAddress || '';
  const uptimeBlockchainID = vmcCtx.staking.settings?.uptimeBlockchainID || '';
  const tokenType: 'native' | 'erc20' =
    vmcCtx.staking.stakingType === 'erc20' ? 'erc20' : 'native';
  const rpcUrl = viemChain?.rpcUrls?.default?.http[0] || '';

  const body = (
    <div className="flex flex-col rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">Initiate Removal</h3>
          <ManagerTypeBadge
            ownerType={vmcCtx.ownerType}
            stakingType={vmcCtx.staking.stakingType}
            isDetecting={isDetecting}
          />
          {isStaking && posMode === 'force' && (
            <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400">
              Force mode
            </span>
          )}
        </div>

        {!store.subnetIdL1 && (
          <Alert variant="warning">
            No L1 subnet selected. Go back to <strong>Select L1 Subnet</strong> to choose one.
          </Alert>
        )}

        {vmcCtx.chainMismatch && <VmcChainSwitchBanner mismatch={vmcCtx.chainMismatch} />}

        {!isDetecting && !vmcCtx.chainMismatch && (
          <>
            {isStaking ? (
              <>
                <SelectValidationID
                  value={store.validationId}
                  onChange={(selection) => {
                    store.setValidationId(selection.validationId);
                    store.setNodeId(selection.nodeId);
                    // Reset the force-mode escape hatch when the user changes
                    // validators — the ineligibility was per-validator.
                    setIneligibleForRewards(false);
                    setPosMode('uptime');
                  }}
                  format="hex"
                  subnetId={store.subnetIdL1}
                  // getValidator() lives on the underlying VMC, not the StakingManager.
                  // For composition-model L1s they're different addresses; passing
                  // the StakingManager would make the picker show "Unknown" status.
                  validatorManagerAddress={vmcCtx.validatorManagerAddress || stakingManagerAddress}
                />

                {store.nodeId && (
                  <p className="text-xs text-zinc-500">
                    Validator: <code className="font-mono text-zinc-700 dark:text-zinc-300">{store.nodeId}</code>
                  </p>
                )}

                {store.validationId && stakingManagerAddress && (
                  <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 space-y-3">
                    {posMode === 'uptime' ? (
                      <StakingInitiateValidatorRemovalUptime
                        validationID={store.validationId}
                        stakingManagerAddress={stakingManagerAddress}
                        validatorManagerAddress={vmcCtx.validatorManagerAddress || stakingManagerAddress}
                        rpcUrl={rpcUrl}
                        uptimeBlockchainID={uptimeBlockchainID}
                        tokenType={tokenType}
                        onSuccess={(data) => {
                          setIneligibleForRewards(false);
                          store.setEvmTxHash(data.txHash);
                          store.setGlobalError(null);
                        }}
                        onError={(message) => {
                          // Surface the force-remove escape hatch only when the
                          // contract specifically signaled rewards-ineligibility.
                          if (message.includes('ineligible for rewards') || message.includes('ValidatorIneligibleForRewards')) {
                            setIneligibleForRewards(true);
                          }
                          store.setGlobalError(message);
                        }}
                      />
                    ) : (
                      <StakingInitiateValidatorRemoval
                        validationID={store.validationId}
                        stakingManagerAddress={stakingManagerAddress}
                        validatorManagerAddress={vmcCtx.validatorManagerAddress || stakingManagerAddress}
                        rpcUrl={rpcUrl}
                        signingSubnetId={vmcCtx.signingSubnetId || store.subnetIdL1}
                        tokenType={tokenType}
                        onSuccess={(data) => {
                          store.setEvmTxHash(data.txHash);
                          store.setGlobalError(null);
                        }}
                        onError={(message) => store.setGlobalError(message)}
                      />
                    )}

                    {ineligibleForRewards && posMode === 'uptime' && (
                      <Alert variant="warning">
                        <div className="space-y-2">
                          <p className="text-sm">
                            This validator is below the uptime threshold required to receive staking rewards. You can
                            force-remove them now — but the rewards will be permanently forfeited.
                          </p>
                          <Button
                            onClick={() => setPosMode('force')}
                            variant="secondary"
                            size="sm"
                          >
                            Force remove (forfeit rewards)
                          </Button>
                        </div>
                      </Alert>
                    )}

                    {posMode === 'force' && (
                      <Button
                        onClick={() => {
                          setPosMode('uptime');
                          setIneligibleForRewards(false);
                        }}
                        variant="outline"
                        size="sm"
                      >
                        ← Back to uptime-proof removal
                      </Button>
                    )}
                  </div>
                )}
              </>
            ) : (
              <PoAInitiateValidatorRemoval
                subnetId={store.subnetIdL1 || ''}
                validatorManagerAddress={vmcCtx.validatorManagerAddress}
                resetForm={false}
                initialNodeId={store.nodeId}
                initialValidationId={store.validationId}
                ownershipState={vmcCtx.ownershipStatus}
                refetchOwnership={vmcCtx.refetchOwnership}
                ownershipError={vmcCtx.ownershipError}
                onSuccess={(data) => {
                  store.setNodeId(data.nodeId);
                  store.setValidationId(data.validationId);
                  store.setEvmTxHash(data.txHash);
                  store.setGlobalError(null);
                }}
                onError={(message) => store.setGlobalError(message)}
              />
            )}
          </>
        )}
      </div>
      <div className="shrink-0 px-4 py-2.5 border-t border-zinc-200/80 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-between mt-auto">
        <span className="text-xs text-zinc-500">
          {isStaking && posMode === 'force'
            ? 'Calls forceInitiateValidatorRemoval()'
            : 'Calls initiateValidatorRemoval()'}
        </span>
        <a
          href={`https://github.com/ava-labs/icm-services/tree/${ICM_COMMIT}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 font-mono transition-colors"
        >
          @{ICM_COMMIT.slice(0, 7)}
        </a>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <div className="space-y-4">{body}</div>
      <StepCodeViewer activeStep={1} steps={stepConfig} className="lg:sticky lg:top-4 lg:self-start" />
    </div>
  );
}
