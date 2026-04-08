import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string; // PATIENT, THERAPIST, ADMIN, ORG_ADMIN, HR_MANAGER
      image?: string;
    };
  }

  interface User {
    role?: string;
    orgRole?: string | null;
    organizationId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    id?: string;
    orgRole?: string | null;
    organizationId?: string | null;
  }
}
