"use client";

import { useToolboxStore, useViemChainStore } from "../toolboxStore";
import { useWalletStore } from "../../lib/walletStore";
import { useErrorBoundary } from "react-error-boundary";
import { useState } from "react";
import { Button } from "../../components/Button";
import { ResultField } from "../components/ResultField";
import { keccak256 } from 'viem';
import ValidatorManagerABI from "../../../contracts/icm-contracts/compiled/ValidatorManager.json";
import { Container } from "../components/Container";
function calculateLibraryHash(libraryPath: string) {
    const hash = keccak256(
        new TextEncoder().encode(libraryPath)
    ).slice(2);
    return hash.slice(0, 34);
}

export default function DeployValidatorManager() {
    const { showBoundary } = useErrorBoundary();
    const { validatorMessagesLibAddress, setValidatorManagerAddress, validatorManagerAddress } = useToolboxStore();
    const { coreWalletClient, publicClient } = useWalletStore();
    const [isDeploying, setIsDeploying] = useState(false);
    const viemChain = useViemChainStore();

    const getLinkedBytecode = () => {
        if (!validatorMessagesLibAddress) {
            throw new Error('ValidatorMessages library must be deployed first');
        }

        const libraryPath = `${Object.keys(ValidatorManagerABI.bytecode.linkReferences)[0]}:${Object.keys(Object.values(ValidatorManagerABI.bytecode.linkReferences)[0])[0]}`;
        const libraryHash = calculateLibraryHash(libraryPath);
        const libraryPlaceholder = `__$${libraryHash}$__`;

        const linkedBytecode = ValidatorManagerABI.bytecode.object
            .split(libraryPlaceholder)
            .join(validatorMessagesLibAddress.slice(2).padStart(40, '0'));

        if (linkedBytecode.includes("$__")) {
            throw new Error("Failed to replace library placeholder with actual address");
        }

        return linkedBytecode as `0x${string}`;
    };

    async function handleDeploy() {
        setIsDeploying(true);
        setValidatorManagerAddress("");
        try {
            if (!viemChain) throw new Error("Viem chain not found");
            await coreWalletClient.addChain({ chain: viemChain });
            await coreWalletClient.switchChain({ id: viemChain!.id });

            const hash = await coreWalletClient.deployContract({
                abi: ValidatorManagerABI.abi,
                bytecode: getLinkedBytecode(),
                args: [0], // TODO: Not sure about this. Please check the source https://github.com/ava-labs/icm-contracts/blob/48fe4883914b46ec7e4385dc0edf5c2df31c99f4/contracts/validator-manager/ValidatorManager.sol#L136C21-L136C48
                chain: viemChain,
            });

            const receipt = await publicClient.waitForTransactionReceipt({ hash });

            if (!receipt.contractAddress) {
                throw new Error('No contract address in receipt');
            }

            setValidatorManagerAddress(receipt.contractAddress);
        } catch (error) {
            showBoundary(error);
        } finally {
            setIsDeploying(false);
        }
    }

    return (
        <Container
            title="Deploy Validator Manager"
            description="This will deploy the ValidatorManager contract to the EVM network."
        >
            <div className="space-y-4">
                <div className="mb-4">
                    <div className="mb-4">
                        This will deploy the <code>ValidatorManager</code> contract to the EVM network <code>{viemChain?.id}</code>.
                    </div>
                    <div className="mb-4">
                        The contract requires the <code>ValidatorMessages</code> library at address: <code>{validatorMessagesLibAddress || "Not deployed"}</code>
                    </div>
                    <Button
                        variant="primary"
                        onClick={handleDeploy}
                        loading={isDeploying}
                        disabled={isDeploying || !validatorMessagesLibAddress}
                    >
                        Deploy Contract
                    </Button>
                </div>
                {validatorManagerAddress && (
                    <ResultField
                        label="ValidatorManager Address"
                        value={validatorManagerAddress}
                        showCheck={!!validatorManagerAddress}
                    />
                )}
            </div>
        </Container>
    );
};
