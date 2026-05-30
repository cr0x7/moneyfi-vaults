import CreateVaultWizard from '@/components/CreateVaultWizard'

export default function CreateVaultPage() {
  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, color: '#555', fontWeight: 600, letterSpacing: 2, marginBottom: 8 }}>
            VAULT FACTORY
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', marginBottom: 8 }}>
            Create Your Vault
          </h1>
          <p style={{ fontSize: 14, color: '#666' }}>
            Deploy a custom DeFi vault with your chosen strategy, risk level, and deposit amount.
            Start earning automatically in minutes.
          </p>
        </div>
        <CreateVaultWizard />
      </div>
    </div>
  )
}
