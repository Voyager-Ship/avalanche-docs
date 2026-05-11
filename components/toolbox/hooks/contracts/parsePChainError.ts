/**
 * Maps common P-Chain operation errors to human-readable messages.
 * Used by components that submit transactions directly to the P-Chain
 * (registerL1Validator, setL1ValidatorWeight, disableL1Validator, etc.).
 */
export function parsePChainError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);

  if (raw.includes('User rejected')) return 'Transaction was rejected by user';
  if (raw.includes('insufficient funds')) return 'Insufficient P-Chain balance for transaction';

  // Signature aggregation returned a partial result that doesn't meet 67% quorum.
  // P-Chain rejects with: "signature weight is insufficient: 67*<total> > 100*<signed>".
  // Surface the actual percentage signed so the user knows it's a transient
  // aggregator hiccup, not a configuration issue — retry usually succeeds.
  if (raw.includes('signature weight is insufficient')) {
    const match = raw.match(/67\*(\d+) > 100\*(\d+)/);
    if (match) {
      const total = BigInt(match[1]);
      const signed = BigInt(match[2]);
      const percent = total > 0n ? Number((signed * 10000n) / total) / 100 : 0;
      return (
        `Signature aggregator only collected ${percent.toFixed(1)}% of the subnet's stake ` +
        `(need 67%). This is usually a transient issue with the aggregator service — retry ` +
        `the P-Chain submission in a moment. If it keeps failing, some signing validators ` +
        `may be offline.`
      );
    }
    return (
      'Signature aggregator returned a partial signature below the 67% quorum required ' +
      'by P-Chain. Usually transient — retry the P-Chain submission.'
    );
  }

  // Validator not in a state P-Chain considers valid for this op
  // (e.g. already removed, never registered, wrong sourceChainID for the L1).
  if (raw.includes('failed to fetch sov') || raw.includes('failed to get validator')) {
    return (
      "P-Chain has no record of this validator (or it's already removed). Verify the " +
      'validation ID and check the validator set query before retrying.'
    );
  }

  if (raw.includes('nonce')) return 'Transaction nonce error. Please try again.';
  if (raw.includes('execution reverted')) return `Transaction reverted: ${raw}`;

  return raw;
}
