export type ClaimStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

export interface PortfolioClaimRequest {
  claim_id: string
  artist_id: string
  requester_auth_id: string
  requester_email: string
  requester_phone: string | null
  email_matches: boolean | null
  phone_matches: boolean | null
  status: ClaimStatus
  reviewed_by: string | null
  reviewed_at: string | null
  rejection_reason: string | null
  created_at: string
  updated_at: string
}

export interface PortfolioClaimRequestWithArtist extends PortfolioClaimRequest {
  artist_user: {
    artist_id: string
    name: string
    email: string
    phone: string
    birth: string | null
    auth_id: string | null
  }
}

export interface PortfolioClaimRequestWithRequester extends PortfolioClaimRequest {
  requester_profile: {
    auth_id: string
    user_type: string
    email: string
  }
}

export interface CreateClaimRequestData {
  artist_id: string
  requester_phone?: string
}

export interface ClaimApprovalResponse {
  success: boolean
  error?: string
  artist_id?: string
  message?: string
}
