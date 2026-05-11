/**
 * Maps common P-Chain operation errors to human-readable messages.
 * Used by components that submit transactions directly to the P-Chain
 * (registerL1Validator, setL1ValidatorWeight, disableL1Validator, etc.).
 */
export function parsePChainError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);

  if (raw.includes('User rejected')) return 'Transaction was rejected by user';
  if (raw.includes('insufficient funds')) return 'Insufficient P-Chain balance for transaction';

  // P-Chain rejects with: "signature weight is insufficient: 67*<total> > 100*<signed>".
  // The most common cause is a signing-subnet mismatch — the aggregator was
  // pointed at the wrong subnet so the collected sigs don't count toward the
  // L1's required quorum. A genuinely transient aggregator hiccup is rarer.
  if (raw.includes('signature weight is insufficient')) {
    const match = raw.match(/67\*(\d+) > 100\*(\d+)/);
    if (match) {
      const total = BigInt(match[1]);
      const signed = BigInt(match[2]);
      const percent = total > 0n ? Number((signed * 10000n) / total) / 100 : 0;
      return (
        `Aggregated signature only covers ${percent.toFixed(1)}% of the L1's validator weight ` +
        `(need 67%). Most often this means the warp was signed by the wrong subnet — verify ` +
        `the signing-subnet hint matches the validator's L1. If the configuration looks right, ` +
        `it can also be a transient aggregator response gap; retry once before investigating further.`
      );
    }
    return (
      "Aggregated signature is below the 67% quorum the L1's validator set requires. " +
      'Usually a signing-subnet mismatch; retry once, then check config if it persists.'
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
