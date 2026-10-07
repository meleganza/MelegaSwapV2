export function farmIdentity(chainId: number, masterChef: string, pid: number): string {
  return `${chainId}:${(masterChef || 'unknown').toLowerCase()}:${pid}`
}

export function poolIdentity(chainId: number, contractAddress: string): string {
  return `${chainId}:${(contractAddress || '').toLowerCase()}`
}
