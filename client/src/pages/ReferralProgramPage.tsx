import { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'
import { Card, Button } from '../components/ui'
import BackButton from '../components/ui/BackButton'

interface Referral {
  id: string
  email: string
  username: string
  status: 'pending' | 'completed'
  earnedAt?: string
  amount: number
}

export default function ReferralProgramPage() {
  const { user } = useAuthStore()
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [copiedLink, setCopiedLink] = useState(false)
  const [payoutMethod, setPayoutMethod] = useState('bank_transfer')
  const [bankDetails, setBankDetails] = useState({
    accountName: '',
    accountNumber: '',
    sortCode: '',
  })

  // Load referrals from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(`referrals_${user?.id}`)
    if (stored) {
      setReferrals(JSON.parse(stored))
    }
  }, [user?.id])

  const referralLink = `${window.location.origin}/register?ref=${user?.username}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const completedReferrals = referrals.filter(r => r.status === 'completed')
  const totalEarnings = completedReferrals.reduce((sum, r) => sum + r.amount, 0)
  const pendingEarnings = referrals
    .filter(r => r.status === 'pending')
    .reduce((sum, r) => sum + r.amount, 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <BackButton />

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-khc-primary">Referral Program</h1>
        <p className="text-gray-600 mt-2">Earn £20 for each successful referral</p>
      </div>

      {/* Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-center">
            <p className="text-gray-600 mb-2">Total Earnings</p>
            <p className="text-4xl font-bold text-khc-primary">{formatCurrency(totalEarnings)}</p>
            <p className="text-sm text-gray-500 mt-2">{completedReferrals.length} completed referrals</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-gray-600 mb-2">Pending Earnings</p>
            <p className="text-4xl font-bold text-yellow-600">{formatCurrency(pendingEarnings)}</p>
            <p className="text-sm text-gray-500 mt-2">{referrals.filter(r => r.status === 'pending').length} pending referrals</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-gray-600 mb-2">Next Payout</p>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(totalEarnings)}</p>
            <p className="text-sm text-gray-500 mt-2">Monthly on 1st</p>
          </div>
        </Card>
      </div>

      {/* Referral Link Section */}
      <Card title="Your Referral Link">
        <div className="space-y-4">
          <p className="text-gray-700">Share this link with your network and earn £20 for each successful sign-up:</p>

          <div className="flex gap-2">
            <div className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 font-mono text-sm text-gray-700 overflow-auto">
              {referralLink}
            </div>
            <button
              onClick={handleCopyLink}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                copiedLink
                  ? 'bg-green-500 text-white'
                  : 'bg-khc-primary text-white hover:bg-khc-secondary'
              }`}
            >
              {copiedLink ? '✓ Copied' : 'Copy'}
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>💡 Tip:</strong> Share this link on social media, email, or directly with colleagues. You'll earn £20 each time someone signs up using your link.
            </p>
          </div>
        </div>
      </Card>

      {/* How It Works */}
      <Card title="How the Referral Program Works">
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-khc-primary text-white font-bold">
                1
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Share Your Link</h3>
              <p className="text-gray-600">Copy your unique referral link and share it with QS professionals and SME contractors.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-khc-primary text-white font-bold">
                2
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">They Sign Up</h3>
              <p className="text-gray-600">When someone clicks your link and creates an account, they become your referral.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-khc-primary text-white font-bold">
                3
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">You Earn £20</h3>
              <p className="text-gray-600">Once they complete their first purchase, you earn £20. No limits on how many you can refer!</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-khc-primary text-white font-bold">
                4
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Get Paid</h3>
              <p className="text-gray-600">Payouts are processed monthly on the 1st of each month to your selected bank account.</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Referral History */}
      <Card title="Referral History">
        {referrals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="mb-4">No referrals yet. Start sharing your link to earn!</p>
            <Button variant="primary" onClick={handleCopyLink}>
              Copy Link
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Name</th>
                  <th className="px-4 py-3 text-left font-semibold">Email</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Earnings</th>
                  <th className="px-4 py-3 text-left font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {referrals.map(referral => (
                  <tr key={referral.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{referral.username}</td>
                    <td className="px-4 py-3 text-gray-600">{referral.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        referral.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-khc-primary">
                      {formatCurrency(referral.amount)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {referral.earnedAt ? new Date(referral.earnedAt).toLocaleDateString() : 'Pending'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Payout Settings */}
      <Card title="Payout Settings">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Payout Method</label>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="payout"
                  value="bank_transfer"
                  checked={payoutMethod === 'bank_transfer'}
                  onChange={(e) => setPayoutMethod(e.target.value)}
                  className="w-4 h-4"
                />
                <div>
                  <p className="font-medium text-gray-900">UK Bank Transfer</p>
                  <p className="text-sm text-gray-600">Direct to your bank account (recommended)</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="payout"
                  value="paypal"
                  checked={payoutMethod === 'paypal'}
                  onChange={(e) => setPayoutMethod(e.target.value)}
                  className="w-4 h-4"
                />
                <div>
                  <p className="font-medium text-gray-900">PayPal</p>
                  <p className="text-sm text-gray-600">Sent to your PayPal account</p>
                </div>
              </label>
            </div>
          </div>

          {payoutMethod === 'bank_transfer' && (
            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-semibold text-gray-900">Bank Account Details</h4>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                <input
                  type="text"
                  value={bankDetails.accountName}
                  onChange={(e) => setBankDetails({ ...bankDetails, accountName: e.target.value })}
                  placeholder="As it appears on your bank account"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-khc-primary"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort Code</label>
                  <input
                    type="text"
                    value={bankDetails.sortCode}
                    onChange={(e) => setBankDetails({ ...bankDetails, sortCode: e.target.value })}
                    placeholder="XX-XX-XX"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-khc-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                  <input
                    type="text"
                    value={bankDetails.accountNumber}
                    onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                    placeholder="8 digits"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-khc-primary"
                  />
                </div>
              </div>

              <Button variant="primary" fullWidth>
                Save Bank Details
              </Button>
            </div>
          )}

          {payoutMethod === 'paypal' && (
            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-semibold text-gray-900">PayPal Account</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PayPal Email</label>
                <input
                  type="email"
                  placeholder="your@paypal.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-khc-primary"
                />
              </div>
              <Button variant="primary" fullWidth>
                Save PayPal Details
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* FAQ */}
      <Card title="Frequently Asked Questions">
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">How much can I earn?</h4>
            <p className="text-gray-700">Unlimited! There are no caps on referrals. Earn £20 for each person who signs up with your link.</p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">When do I get paid?</h4>
            <p className="text-gray-700">Referral earnings are paid out monthly on the 1st of each month to your chosen payout method.</p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">What counts as a valid referral?</h4>
            <p className="text-gray-700">A valid referral is someone who clicks your unique link and completes their first paid subscription.</p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Can I share my link on social media?</h4>
            <p className="text-gray-700">Yes! Share it anywhere - LinkedIn, Twitter, Facebook, email, or directly with colleagues. The more you share, the more you earn.</p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Is there a minimum payout?</h4>
            <p className="text-gray-700">No minimum. Once you have earnings, they'll be paid out monthly on the 1st.</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
