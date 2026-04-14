import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getManagedCourseIdsForUser, getUserRole } from "@/lib/roles";

export async function GET() {
    const session = await auth();
    const username = session?.user?.githubUsername;
    if (!username) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = await getUserRole(username);
    const courseIds = await getManagedCourseIdsForUser(username, role);
    return NextResponse.json({
        role,
        courseIds,
    });
}
