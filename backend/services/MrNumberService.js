import prisma from '../config/prismaClient.js';

class MrNumberService {
    static async generateMrNumber() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');

        // Format: MR-YYYYMMDD-XXXX
        const prefix = `MR-${year}${month}${day}`;

        // Find the last MR number created today
        const lastPatient = await prisma.patient.findFirst({
            where: {
                mrNumber: {
                    startsWith: prefix
                }
            },
            orderBy: {
                mrNumber: 'desc'
            }
        });

        let nextSequence = 1;

        if (lastPatient && lastPatient.mrNumber) {
            const parts = lastPatient.mrNumber.split('-');
            if (parts.length === 3) {
                const lastSequence = parseInt(parts[2], 10);
                if (!isNaN(lastSequence)) {
                    nextSequence = lastSequence + 1;
                }
            }
        }

        return `${prefix}-${String(nextSequence).padStart(4, '0')}`;
    }

    static async getPreviewMrNumber() {
        return this.generateMrNumber();
    }
}

export default MrNumberService;
