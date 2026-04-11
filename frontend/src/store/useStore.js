'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/utils/api';
import { v4 as uuidv4 } from 'uuid';

const getUIMetaForPlan = (type) => {
  const meta = {
    'Poultry': { image: '/images/poultry.jpg', features: ['High health monitoring', 'Short cycle turnover', 'Daily farm updates'], roi: '15-20%' },
    'Goat': { image: '/images/goat.jpg', features: ['Pasture raised', 'Medium term maturity', 'Monthly updates'], roi: '25-30%' },
    'Cattle': { image: '/images/cattle.jpg', features: ['Premium breed', 'Long term hold', 'Quarterly updates'], roi: '40-50%' },
    'Pig': { image: '/images/pigs.jpg', features: ['High demand market', 'Rapid weight gain', 'Bi-weekly updates'], roi: '20-25%' },
  };
  return meta[type] || { image: '/images/default.jpg', features: ['Standard Care', 'Sustainable practice'], roi: 'Variable' };
};

const useStore = create(
  persist(
    (set, get) => ({
      // ── Auth ──
      currentUser: null,
      isAdmin: false,
      token: null,
      wallet: null,

      login: async (email, password) => {
        try {
          const res = await api.post('/auth/login', { email, password });
          const { id, fullName, email: uEmail, phone, role, token } = res.data;
          set({
            currentUser: { id, name: fullName, email: uEmail, phone, role },
            isAdmin: role === 'admin',
            token
          });
          get().initializeData(); // Bootstrapping remote data
          return { success: true };
        } catch (error) {
          return { success: false, error: error.message || 'Invalid credentials' };
        }
      },

      adminLogin: async (email, password) => {
        // We use the same login logic, just ensure they are an admin
        const response = await get().login(email, password);
        if (response.success && !get().isAdmin) {
          get().logout();
          return { success: false, error: 'Access denied: You are not an admin.' };
        }
        return response;
      },

      logout: () => {
        set({ currentUser: null, isAdmin: false, token: null });
      },

      register: async (name, email, phone, password) => {
        try {
          const res = await api.post('/auth/register', { fullName: name, email, phone, password });
          const { id, fullName, email: uEmail, phone: uPhone, role, token } = res.data;
          set({
            currentUser: { id, name: fullName, email: uEmail, phone: uPhone, role },
            isAdmin: false,
            token
          });
          get().addToast('Account registered successfully!');
          get().initializeData();
          return { success: true };
        } catch (error) {
          return { success: false, error: error.message || 'Registration failed' };
        }
      },

      // ── Users ──
      // Dynamic fetch not strictly needed unless admin lists them, 
      // but keeping compatibility with 'users.length' stats:
      users: [],

      // ── Plans ──
      plans: [],

      fetchPlans: async () => {
        try {
          const res = await api.get('/plans');
          // Hydrate with UI fields
          const formattedPlans = res.data.map(p => ({
            ...p,
            title: `${p.type} Plan`,
            ...getUIMetaForPlan(p.type)
          }));
          set({ plans: formattedPlans });
        } catch (error) {}
      },

      addPlan: async (planData) => {
        try {
          const res = await api.post('/plans', planData);
          const formattedPlan = { ...res.data, title: `${res.data.type} Plan`, ...getUIMetaForPlan(res.data.type) };
          set((state) => ({ plans: [...state.plans, formattedPlan] }));
          get().addToast(`Plan "${formattedPlan.title}" created`, 'success');
        } catch (e) {
          get().addToast(e.message || 'Failed to create plan', 'error');
        }
      },

      updatePlan: async (id, updates) => {
        try {
          const res = await api.put(`/plans/${id}`, updates);
          const formattedPlan = { ...res.data, title: `${res.data.type} Plan`, ...getUIMetaForPlan(res.data.type) };
          set((state) => ({
            plans: state.plans.map((p) => (p.id === id ? formattedPlan : p)),
          }));
          get().addToast('Plan updated', 'success');
        } catch (e) {
          get().addToast(e.message || 'Failed to update plan', 'error');
        }
      },

      deletePlan: async (id) => {
        try {
          await api.delete(`/plans/${id}`);
          set((state) => ({
            plans: state.plans.filter((p) => p.id !== id),
          }));
          get().addToast('Plan deleted', 'success');
        } catch (e) {
          get().addToast(e.message || 'Failed to delete plan', 'error');
        }
      },

      togglePlanStatus: async (id) => {
        const plan = get().plans.find(p => p.id === id);
        if (plan) {
           await get().updatePlan(id, { status: plan.status === 'active' ? 'inactive' : 'active' });
        }
      },

      // ── Applications ──
      applications: [],

      fetchApplications: async () => {
        try {
          const res = await api.get('/applications');
          const formatted = res.data.map(a => ({
            ...a,
            userName: a.user?.fullName,
            userEmail: a.user?.email,
            userPhone: a.user?.phone,
            appliedDate: new Date(a.createdAt).toISOString().slice(0, 10)
          }));
          set({ applications: formatted });
        } catch (e) {}
      },

      submitApplication: async (userId, planId, paymentReference) => {
        try {
          const res = await api.post('/applications', { planId, paymentReference });
          set((state) => ({
            applications: [...state.applications, res.data],
          }));
          get().addToast('Application submitted successfully!');
          return res.data.id;
        } catch (e) {
          get().addToast(e.message || 'Failed to apply', 'error');
          throw e; // Reraise for UI catch
        }
      },

      approveApplication: async (id) => {
        try {
          await api.put(`/applications/${id}/status`, { status: 'approved' });
          set((state) => ({
            applications: state.applications.map((a) =>
              a.id === id ? { ...a, status: 'approved' } : a
            ),
          }));
          get().addToast('Application approved', 'success');
        } catch (e) {
          get().addToast(e.message || 'Failed to approve', 'error');
        }
      },

      rejectApplication: async (id) => {
        try {
          await api.put(`/applications/${id}/status`, { status: 'rejected' });
          set((state) => ({
            applications: state.applications.map((a) =>
              a.id === id ? { ...a, status: 'rejected' } : a
            ),
          }));
          get().addToast('Application rejected', 'success');
        } catch (e) {
          get().addToast(e.message || 'Failed to reject', 'error');
        }
      },

      // ── Payments ──
      payments: [],

      fetchPayments: async () => {
        try {
          const res = await api.get('/payments');
          const formatted = res.data.map(p => ({
            ...p,
            userName: p.user?.fullName || 'Unknown User',
            date: new Date(p.createdAt).toISOString().slice(0, 10)
          }));
          set({ payments: formatted });
        } catch (e) {}
      },

      fetchWallet: async () => {
        try {
          const res = await api.get('/wallet');
          set({ wallet: res.data });
        } catch (e) {}
      },

      initializePayment: async (amount, applicationId) => {
        try {
          const res = await api.post('/payments', { amount, applicationId });
          return res.data;
        } catch (e) {
          get().addToast(e.message || 'Payment initialization failed', 'error');
          throw e;
        }
      },

      simulatePayment: async (applicationId, userId, userName) => {
        try {
          // Find standard app fee
          const res = await get().initializePayment(50, applicationId);
          window.location.href = res.authorization_url;
          return res;
        } catch (e) {
          throw e;
        }
      },

      confirmPayment: async (applicationId) => {
        // This is handled automatically by Paystack Webhooks on the backend.
        // We will just silently refetch the data when confirm is clicked locally to sync 
        get().addToast('Syncing payment status with server...', 'success');
        await get().fetchApplications();
        await get().fetchPayments();
      },

      // ── Updates ──
      updates: [],

      fetchUpdates: async () => {
        try {
          const res = await api.get('/updates');
          const formatted = res.data.map(u => ({
            ...u,
            date: new Date(u.createdAt).toISOString().slice(0, 10)
          }));
          set({ updates: formatted });
        } catch (e) {}
      },

      addUpdate: async (updateData) => {
        try {
          const res = await api.post('/updates', updateData);
          set((state) => ({
            updates: [res.data, ...state.updates]
          }));
          get().addToast('Farm update posted', 'success');
        } catch (e) {
          get().addToast(e.message || 'Failed to post update', 'error');
        }
      },

      updateUpdate: (id, data) => {
        // Backend doesn't currently support PUT /updates/:id in plan, skipping strict integration
        set((state) => ({
          updates: state.updates.map((u) => (u.id === id ? { ...u, ...data } : u)),
        }));
      },

      deleteUpdate: (id) => {
        // Backend doesn't currently support DELETE /updates/:id in plan, skipping strict integration
        set((state) => ({
          updates: state.updates.filter((u) => u.id !== id),
        }));
      },

      // ── Remote Data Bootstrapper ──
      initializeData: async () => {
        // Run safely without crashing if backend is down
        try {
          await get().fetchPlans();
          await get().fetchUpdates();
          
          if (get().currentUser) {
             await get().fetchWallet();
             await get().fetchApplications();
          }

          if (get().isAdmin) {
             await get().fetchPayments();
             // In a robust implementation, user list would also be fetched here.
          }
        } catch (e) {
             console.error("Hydration Error: ", e);
        }
      },

      // ── Activity Log (Stay local for mock) ──
      activities: [],

      logActivity: (message, type, actor) => {
        const activity = { id: `act-${uuidv4().slice(0, 8)}`, message, type, actor, timestamp: new Date().toISOString() };
        set((state) => ({ activities: [activity, ...state.activities] }));
      },

      // ── Computed helpers ──
      getStats: () => {
        const state = get();
        return {
          totalUsers: state.users.length || 0,
          totalApplications: state.applications.length,
          activeInvestments: state.applications.filter(
            (a) => a.status === 'approved' && a.paymentStatus === 'paid'
          ).length,
          totalRevenue: state.payments
            .filter((p) => p.status === 'success')
            .reduce((sum, p) => sum + p.amount, 0),
          pendingApplications: state.applications.filter(
            (a) => a.status === 'pending'
          ).length,
          pendingPayments: state.payments.filter(
            (p) => p.status === 'pending'
          ).length,
        };
      },

      getUserApplications: (userId) => get().applications.filter((a) => a.userId === userId || (a.user && a.user.id === userId)),

      getUserPayments: (userId) => get().payments.filter((p) => p.userId === userId || (p.user && p.user.id === userId)),

      getPlanById: (id) => get().plans.find((p) => p.id === id),

      // ── Toast ──
      toasts: [],
      addToast: (message, type = 'success') => {
        const id = uuidv4();
        set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
        setTimeout(() => {
          set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
        }, 4000);
      },
      removeToast: (id) => {
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
      },
    }),
    {
      name: 'livestock-investment-store',
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAdmin: state.isAdmin,
        token: state.token
        // Note: Removing plans, apps, etc from pure persistent storage to ensure
        // fresh fetch occurs across reloads
      }),
    }
  )
);

export default useStore;
