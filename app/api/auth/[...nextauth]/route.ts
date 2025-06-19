// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/auth"    // adjust path if you placed auth.ts elsewhere

export const { GET, POST } = handlers
