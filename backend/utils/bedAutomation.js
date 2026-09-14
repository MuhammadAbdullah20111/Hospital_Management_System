import prisma from '../config/prismaClient.js';

/**
 * Automatically transitions beds from 'CLEANING' status to 'AVAILABLE'
 * if they have been in the cleaning state for more than 15 minutes.
 */
export const startBedAutomation = () => {
    console.log('[Bed Automation] Service started. Checking every 60 seconds...');
    
    // Check every 60 seconds
    setInterval(async () => {
        try {
            // Calculate the cutoff time (15 minutes ago)
            const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
            
            // Find and update beds
            const result = await prisma.bed.updateMany({
                where: {
                    status: 'CLEANING',
                    updatedAt: {
                        lte: fifteenMinsAgo
                    }
                },
                data: {
                    status: 'AVAILABLE'
                }
            });
            
            if (result.count > 0) {
                console.log(`[Bed Automation] ${new Date().toLocaleTimeString()}: Automatically marked ${result.count} beds as AVAILABLE after 15 mins of cleaning.`);
            }
        } catch (error) {
            console.error("[Bed Automation Error]:", error);
        }
    }, 60 * 1000); 
};
