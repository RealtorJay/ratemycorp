import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [preferences, setPreferences] = useState(null)
  const [followedCompanies, setFollowedCompanies] = useState([])

  const onboardingDone = preferences?.onboarding_done ?? false

  const fetchPreferences = useCallback(async (userId) => {
    if (!userId) return
    const { data } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()
    setPreferences(data)
  }, [])

  const fetchFollowedCompanies = useCallback(async (userId) => {
    if (!userId) return
    const { data } = await supabase
      .from('user_followed_companies')
      .select('company_id')
      .eq('user_id', userId)
    setFollowedCompanies((data || []).map((r) => r.company_id))
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchPreferences(session.user.id)
        fetchFollowedCompanies(session.user.id)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      const u = session?.user ?? null
      setUser(u)
      if (u) {
        fetchPreferences(u.id)
        fetchFollowedCompanies(u.id)
      } else {
        setPreferences(null)
        setFollowedCompanies([])
      }
    })

    return () => subscription.unsubscribe()
  }, [fetchPreferences, fetchFollowedCompanies])

  const signUpWithEmail = (email, password) =>
    supabase.auth.signUp({ email, password })

  const signInWithEmail = (email, password) =>
    supabase.auth.signInWithPassword({ email, password })

  const signInWithGoogle = () =>
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })

  const signOut = () => supabase.auth.signOut()

  const updatePreferences = async (updates) => {
    if (!user) return
    const { data, error } = await supabase
      .from('user_preferences')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .select()
      .single()
    if (!error && data) setPreferences(data)
    return { data, error }
  }

  const followCompany = async (companyId) => {
    if (!user) return
    const { error } = await supabase
      .from('user_followed_companies')
      .insert({ user_id: user.id, company_id: companyId })
    if (!error) setFollowedCompanies((prev) => [...prev, companyId])
    return { error }
  }

  const unfollowCompany = async (companyId) => {
    if (!user) return
    const { error } = await supabase
      .from('user_followed_companies')
      .delete()
      .eq('user_id', user.id)
      .eq('company_id', companyId)
    if (!error) setFollowedCompanies((prev) => prev.filter((id) => id !== companyId))
    return { error }
  }

  return (
    <AuthContext.Provider value={{
      user, session, loading,
      preferences, onboardingDone, followedCompanies,
      signUpWithEmail, signInWithEmail, signInWithGoogle, signOut,
      updatePreferences, followCompany, unfollowCompany,
      refreshPreferences: () => fetchPreferences(user?.id),
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
