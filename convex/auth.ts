import { convexAuth } from '@convex-dev/auth/dist/server';
import { Password } from '@convex-dev/auth/dist/providers/Password';

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      id: 'password',
      profile: async ({ email }) => ({ email, name: email.split('@')[0] }),
      // Optional: enforce stronger passwords
      validatePasswordRequirements: (pw: string) => {
        if (pw.length < 8) throw new Error('Password too short');
      },
    }),
  ],
});
