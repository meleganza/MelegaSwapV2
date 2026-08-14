import useEagerConnect from 'hooks/useEagerConnect'
import useEagerConnectMP from 'hooks/useEagerConnect.bmp'

/** Restore the last wallet before deferred analytics and indexers start. */
export default function WalletSessionRuntime({ miniProgram = false }: { miniProgram?: boolean }) {
  if (miniProgram) return <MiniProgramWalletSession />
  return <StandardWalletSession />
}

function StandardWalletSession() {
  useEagerConnect()
  return null
}

function MiniProgramWalletSession() {
  useEagerConnectMP()
  return null
}
