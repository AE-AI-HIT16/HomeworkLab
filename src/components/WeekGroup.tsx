import type { Assignment, Submission } from "@/types";
import { AssignmentCard } from "./AssignmentCard";

interface WeekGroupProps {
    week: number;
    assignments: Assignment[];
    /** Map assignmentId → Submission for current user */
    submissionMap: Map<string, Submission>;
}

export function WeekGroup({ week, assignments, submissionMap }: WeekGroupProps) {
    return (
        <section>
            <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-md">
                    Week {week}
                </span>
                <span className="text-sm font-normal text-gray-400">
                    {assignments.length} assignments
                </span>
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
                {assignments
                    .sort((a, b) => a.lesson - b.lesson)
                    .map((assignment) => (
                        <AssignmentCard
                            key={assignment.id}
                            assignment={assignment}
                            submission={submissionMap.get(assignment.id)}
                        />
                    ))}
            </div>
        </section>
    );
}
