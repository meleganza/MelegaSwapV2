# Public Pool Factory Adapter V1

`PublicPoolFactoryAdapterV1` is a narrow permission and funding adapter for the
production Melega `SmartChefFactory`.

Activation is deliberately two-step and Founder-signed:

1. deploy and validate the adapter from the protected deployment page;
2. transfer the legacy factory ownership to the validated adapter.

After activation, non-MARCO reward pools are permissionless. Pools whose reward
token is MARCO remain restricted to the adapter owner. Pool deployment and the
complete reward-budget transfer are atomic, so the platform never publishes an
unfunded pool created through this path.

The adapter can return legacy-factory ownership to a nominated address through
`releaseLegacyFactoryOwnership`, providing an explicit rollback path.

Production constants verified on BNB Chain:

- legacy factory: `0x4c33eb3d40c78461dd1a079150fcac6da3c701cf`
- legacy SmartChef init-code hash: `0x6a0d0b073d0d328d62f194cf061b2075570cf5d131eeb707cf7db52ae91c3f9b`
- required owner before activation: `0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0`
