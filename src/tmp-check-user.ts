import { auth } from "@/auth";

async function checkSession() {
    const session = await auth();
    console.log("Current User:", JSON.stringify(session?.user, null, 2));
}

checkSession();
