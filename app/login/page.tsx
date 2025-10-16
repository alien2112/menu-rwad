"use client";

import { RoleBasedAuth } from "@/components/RoleBasedAuth";

export default function LoginPage() {
  return (
    <RoleBasedAuth embedded>
      {/* Login UI is rendered by RoleBasedAuth when unauthenticated */}
    </RoleBasedAuth>
  );
}

"use client";

import { RoleBasedAuth } from "@/components/RoleBasedAuth";

export default function LoginPage() {
  // RoleBasedAuth shows a full login UI when unauthenticated and redirects after success
  return (
    <RoleBasedAuth embedded>
      {/* No children needed; upon authentication, RoleBasedAuth redirects to role dashboard */}
    </RoleBasedAuth>
  );
}


