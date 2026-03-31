"use server";

import { auth } from "@/auth";
import { getUserRole } from "@/lib/roles";
import { getAssignmentById, getSubmission, saveSubmission } from "@/lib/google-sheets";

export interface QuizSubmitResult {
    success: boolean;
    error?: string;
    score?: number;
    correctCount?: number;
    totalCount?: number;
}

export async function submitQuizAction(
    assignmentId: string,
    answers: number[]
): Promise<QuizSubmitResult> {
    // Auth check
    const session = await auth();
    if (!session?.user?.githubUsername) {
        return { success: false, error: "Bạn cần đăng nhập để nộp bài." };
    }

    const role = await getUserRole(session.user.githubUsername);
    if (role === "guest") {
        return { success: false, error: "Khách mời không thể nộp bài." };
    }

    // Get the assignment
    const assignment = await getAssignmentById(assignmentId);
    if (!assignment) {
        return { success: false, error: "Không tìm thấy bài tập." };
    }

    if (assignment.assignmentType !== "quiz" || !assignment.quizData) {
        return { success: false, error: "Bài tập này không phải dạng trắc nghiệm." };
    }

    if (answers.length !== assignment.quizData.length) {
        return { success: false, error: "Số câu trả lời không khớp với số câu hỏi." };
    }

    // Grade the quiz
    const quizData = assignment.quizData;
    let correctCount = 0;
    for (let i = 0; i < quizData.length; i++) {
        if (answers[i] === quizData[i].correctIndex) {
            correctCount++;
        }
    }
    const score = Math.round((correctCount / quizData.length) * 100);

    // Check late status
    const now = new Date();
    const isLate = assignment.dueAt ? now > new Date(assignment.dueAt) : false;

    // Check for existing submission (for retakes)
    const existing = await getSubmission(assignmentId, session.user.githubUsername);

    // Save
    await saveSubmission({
        id: existing?.id ?? crypto.randomUUID(),
        assignmentId,
        githubUsername: session.user.githubUsername,
        studentName: session.user.name ?? session.user.githubUsername,
        submittedAt: now.toISOString(),
        type: "quiz",
        isLate,
        quizAnswers: answers,
        quizScore: score,
        grade: score,  // auto-graded
    });

    return {
        success: true,
        score,
        correctCount,
        totalCount: quizData.length,
    };
}
