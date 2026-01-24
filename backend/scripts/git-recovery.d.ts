/**
 * Git Recovery Script
 * Pulls the latest commit from the repository
 * Used for recovery when issues are detected
 */
export declare function pullLatestCommit(): Promise<{
    success: boolean;
    message: string;
    commit?: string;
}>;
export default pullLatestCommit;
//# sourceMappingURL=git-recovery.d.ts.map