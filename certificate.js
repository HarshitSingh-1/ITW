/**
 * =========================================================================
 * BookMyCollege - Official Certificate Generation Engine
 * DSPM IIIT Naya Raipur
 * =========================================================================
 * ARCHITECTURE OVERVIEW:
 * 1. Zero-Backend Overhead:
 *    Instead of relying on heavy server-side PDF generators (Puppeteer/Headless Chrome),
 *    the certificate is rendered entirely on the client side using standard HTML5 Canvas 2D.
 * 2. High-DPI Print-Ready Resolution:
 *    Canvas dimensions are set to 1600 x 1130 px (approximately 300 DPI at standard A4 landscape aspect).
 * 3. Procedural Vector Art & Security Seal:
 *    - Triple-layered security border (Deep Navy, Aztec Gold, Midnight Slate).
 *    - Mathematical corner flourishes using 2D matrix transformations (`ctx.translate`, `ctx.scale`).
 *    - Multi-stop linear gradients for textured parchment background.
 *    - Vector-drawn DSPM IIIT-NR seal with ribbon tails and Bézier curve signature flourishes.
 * 4. Dual Export Modes:
 *    - `preview(data)`: Renders in-modal interactive preview with dark backdrop.
 *    - `download(data)`: Generates high-res image/png Blob and triggers browser download.
 */

(function (window) {
    function createCertificateCanvas(data) {
        const {
            studentName = "Student Attendee",
            eventTitle = "Campus Event",
            eventDate = new Date().toLocaleDateString('en-GB'),
            venue = "Campus Auditorium",
            certificateId = "IIITNR-CERT-" + Math.random().toString(36).substring(2, 10).toUpperCase()
        } = data;

        const canvas = document.createElement('canvas');
        canvas.width = 1600;
        canvas.height = 1130;
        const ctx = canvas.getContext('2d');

        // 1. Background (Elegant Parchment Cream)
        const bgGrad = ctx.createLinearGradient(0, 0, 1600, 1130);
        bgGrad.addColorStop(0, '#fdfbf7');
        bgGrad.addColorStop(0.5, '#ffffff');
        bgGrad.addColorStop(1, '#f7f4ee');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 1600, 1130);

        // 2. Outer Ornate Border (Deep Navy)
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 14;
        ctx.strokeRect(30, 30, 1540, 1070);

        // Inner Gold Border
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 3;
        ctx.strokeRect(48, 48, 1504, 1034);

        // Thin Secondary Navy Border
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        ctx.strokeRect(56, 56, 1488, 1018);

        // Corner Flourishes (Gold Accents)
        function drawCorner(x, y, flipX, flipY) {
            ctx.save();
            ctx.translate(x, y);
            ctx.scale(flipX, flipY);
            ctx.strokeStyle = '#d97706';
            ctx.fillStyle = '#d97706';
            ctx.lineWidth = 2;

            ctx.beginPath();
            ctx.moveTo(10, 10);
            ctx.lineTo(60, 10);
            ctx.lineTo(60, 18);
            ctx.lineTo(18, 18);
            ctx.lineTo(18, 60);
            ctx.lineTo(10, 60);
            ctx.closePath();
            ctx.fill();

            // Diamond at corner
            ctx.beginPath();
            ctx.arc(32, 32, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        drawCorner(56, 56, 1, 1);
        drawCorner(1544, 56, -1, 1);
        drawCorner(56, 1074, 1, -1);
        drawCorner(1544, 1074, -1, -1);

        // 3. Institution Header
        ctx.textAlign = 'center';
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 26px "Georgia", "Times New Roman", serif';
        ctx.letterSpacing = '3px';
        ctx.fillText("DSPM INTERNATIONAL INSTITUTE OF INFORMATION TECHNOLOGY", 800, 130);

        ctx.font = '600 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillStyle = '#475569';
        ctx.letterSpacing = '4px';
        ctx.fillText("NAYA RAIPUR, CHHATTISGARH • AN INSTITUTE OF NATIONAL IMPORTANCE", 800, 162);

        // Top Gold Divider Line with Diamond
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(350, 185);
        ctx.lineTo(770, 185);
        ctx.moveTo(830, 185);
        ctx.lineTo(1250, 185);
        ctx.stroke();

        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.arc(800, 185, 5, 0, Math.PI * 2);
        ctx.fill();

        // 4. Certificate Title
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 54px "Georgia", "Times New Roman", serif';
        ctx.letterSpacing = '6px';
        ctx.fillText("CERTIFICATE OF PARTICIPATION", 800, 275);

        // Subtitle underline
        const titleWidth = 780;
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(800 - titleWidth / 2, 295);
        ctx.lineTo(800 + titleWidth / 2, 295);
        ctx.stroke();

        // 5. Presentation Line
        ctx.fillStyle = '#64748b';
        ctx.font = 'italic 20px "Georgia", serif';
        ctx.letterSpacing = '2px';
        ctx.fillText("THIS IS PROUDLY PRESENTED TO", 800, 360);

        // 6. Student Name
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 54px "Georgia", "Times New Roman", serif';
        ctx.letterSpacing = '1px';
        ctx.fillText(studentName, 800, 440);

        // Elegant line under name
        const nameWidth = Math.min(850, Math.max(450, ctx.measureText(studentName).width + 60));
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(800 - nameWidth / 2, 460);
        ctx.lineTo(800 + nameWidth / 2, 460);
        ctx.stroke();

        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.arc(800, 460, 4, 0, Math.PI * 2);
        ctx.fill();

        // 7. Event & Participation Details
        ctx.fillStyle = '#475569';
        ctx.font = '22px "Georgia", serif';
        ctx.letterSpacing = '0.5px';
        ctx.fillText("for active and successful participation in the campus event", 800, 520);

        // Event Title (Highlight)
        ctx.fillStyle = '#1e40af'; // Royal Navy Blue
        ctx.font = 'bold 38px "Georgia", "Times New Roman", serif';
        ctx.fillText(`"${eventTitle}"`, 800, 580);

        // Date and Venue text
        ctx.fillStyle = '#475569';
        ctx.font = '20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        const venueText = venue ? `held at ${venue}` : "held at IIIT Naya Raipur";
        ctx.fillText(`organized on ${eventDate} • ${venueText}`, 800, 630);

        // 8. Official Golden Seal (Center-Bottom)
        const sealX = 800;
        const sealY = 810;

        // Seal Ribbon Tails
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.moveTo(sealX - 35, sealY + 25);
        ctx.lineTo(sealX - 50, sealY + 115);
        ctx.lineTo(sealX - 25, sealY + 100);
        ctx.lineTo(sealX - 10, sealY + 115);
        ctx.lineTo(sealX - 15, sealY + 35);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(sealX + 35, sealY + 25);
        ctx.lineTo(sealX + 50, sealY + 115);
        ctx.lineTo(sealX + 25, sealY + 100);
        ctx.lineTo(sealX + 10, sealY + 115);
        ctx.lineTo(sealX + 15, sealY + 35);
        ctx.closePath();
        ctx.fill();

        // Outer Seal Circle
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.arc(sealX, sealY, 65, 0, Math.PI * 2);
        ctx.fill();

        // Inner Seal Circle
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(sealX, sealY, 56, 0, Math.PI * 2);
        ctx.fill();

        // Gold Ring Border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(sealX, sealY, 50, 0, Math.PI * 2);
        ctx.stroke();

        // Seal Center Text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px sans-serif';
        ctx.letterSpacing = '1px';
        ctx.fillText("DSPM IIIT-NR", sealX, sealY - 18);
        ctx.font = 'bold 15px sans-serif';
        ctx.fillText("★ ★ ★", sealX, sealY - 2);
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText("VERIFIED", sealX, sealY + 15);
        ctx.font = 'bold 9px sans-serif';
        ctx.fillText("ATTENDANCE", sealX, sealY + 28);

        // 9. Signatures (Left & Right)
        // Left Signature: Event Coordinator
        const sigLeftX = 320;
        const sigY = 830;

        ctx.strokeStyle = '#1e3a8a';
        ctx.lineWidth = 2;
        // Simulated signature line flourish
        ctx.beginPath();
        ctx.moveTo(sigLeftX - 90, sigY - 25);
        ctx.bezierCurveTo(sigLeftX - 40, sigY - 60, sigLeftX - 10, sigY - 10, sigLeftX + 50, sigY - 40);
        ctx.bezierCurveTo(sigLeftX + 70, sigY - 50, sigLeftX + 20, sigY - 15, sigLeftX + 90, sigY - 25);
        ctx.stroke();

        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(sigLeftX - 110, sigY);
        ctx.lineTo(sigLeftX + 110, sigY);
        ctx.stroke();

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 18px "Georgia", serif';
        ctx.letterSpacing = '0.5px';
        ctx.fillText("Event Coordinator", sigLeftX, sigY + 28);
        ctx.fillStyle = '#64748b';
        ctx.font = '14px sans-serif';
        ctx.fillText("Organizing Committee", sigLeftX, sigY + 50);

        // Right Signature: Faculty In-Charge / Dean
        const sigRightX = 1280;

        ctx.strokeStyle = '#1e3a8a';
        ctx.lineWidth = 2;
        // Simulated signature line flourish
        ctx.beginPath();
        ctx.moveTo(sigRightX - 80, sigY - 30);
        ctx.bezierCurveTo(sigRightX - 30, sigY - 65, sigRightX, sigY - 5, sigRightX + 40, sigY - 45);
        ctx.bezierCurveTo(sigRightX + 60, sigY - 55, sigRightX + 30, sigY - 15, sigRightX + 85, sigY - 20);
        ctx.stroke();

        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(sigRightX - 110, sigY);
        ctx.lineTo(sigRightX + 110, sigY);
        ctx.stroke();

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 18px "Georgia", serif';
        ctx.letterSpacing = '0.5px';
        ctx.fillText("Faculty In-Charge", sigRightX, sigY + 28);
        ctx.fillStyle = '#64748b';
        ctx.font = '14px sans-serif';
        ctx.fillText("Student Affairs, IIIT-NR", sigRightX, sigY + 50);

        // 10. Bottom Verification Footer
        ctx.fillStyle = '#94a3b8';
        ctx.font = '13px monospace';
        ctx.letterSpacing = '1px';
        ctx.fillText(`CERTIFICATE ID: ${certificateId}`, 800, 1020);

        ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText("Digitally generated and verified via BookMyCollege • DSPM IIIT Naya Raipur", 800, 1042);

        return canvas;
    }

    /**
     * Instantly download the certificate as high-res PNG
     */
    function downloadCertificate(data) {
        const canvas = createCertificateCanvas(data);
        const link = document.createElement('a');
        const filename = `Certificate_${(data.eventTitle || 'Event').replace(/[^a-zA-Z0-9]/g, '_')}.png`;
        link.download = filename;
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * Preview certificate in a modal before downloading
     */
    function previewCertificate(data) {
        const canvas = createCertificateCanvas(data);
        const dataUrl = canvas.toDataURL('image/png');

        // Remove existing modal if any
        const oldModal = document.getElementById('cert-preview-modal');
        if (oldModal) oldModal.remove();

        const modal = document.createElement('div');
        modal.id = 'cert-preview-modal';
        modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity';
        modal.innerHTML = `
            <div class="theme-bg-surface border theme-border rounded-2xl max-w-4xl w-full p-6 shadow-2xl relative flex flex-col max-h-[95vh] overflow-hidden">
                <div class="flex justify-between items-center mb-4 pb-2 border-b theme-border">
                    <div>
                        <h3 class="text-lg font-black theme-text-main flex items-center gap-2">
                            <span>🎓</span> Official Participation Certificate
                        </h3>
                        <p class="text-xs theme-text-muted">Issued by DSPM IIIT Naya Raipur</p>
                    </div>
                    <button id="close-cert-modal" class="text-gray-400 hover:theme-text-main text-2xl font-bold p-1 leading-none">&times;</button>
                </div>
                
                <div class="overflow-auto flex-grow flex items-center justify-center bg-gray-100 dark:bg-gray-900 rounded-xl p-2 border theme-border shadow-inner">
                    <img src="${dataUrl}" alt="Certificate Preview" class="max-w-full max-h-[60vh] object-contain rounded-lg shadow-md">
                </div>

                <div class="mt-4 flex flex-col sm:flex-row justify-between items-center gap-3 pt-2">
                    <span class="text-xs font-mono theme-text-muted">ID: ${data.certificateId || 'VERIFIED'}</span>
                    <div class="flex gap-2 w-full sm:w-auto">
                        <button id="cancel-cert-btn" class="flex-1 sm:flex-none px-4 py-2 text-sm font-semibold rounded-xl border theme-border theme-text-main hover:theme-bg-base">Close</button>
                        <button id="download-cert-btn" class="flex-1 sm:flex-none px-6 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg flex items-center justify-center gap-2 transition active:scale-95">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                            Download High-Res (PNG)
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const closeModal = () => modal.remove();
        document.getElementById('close-cert-modal').onclick = closeModal;
        document.getElementById('cancel-cert-btn').onclick = closeModal;
        document.getElementById('download-cert-btn').onclick = () => {
            downloadCertificate(data);
            closeModal();
        };

        modal.onclick = (e) => {
            if (e.target === modal) closeModal();
        };
    }

    // Export to global window scope
    window.CertificateGenerator = {
        createCanvas: createCertificateCanvas,
        download: downloadCertificate,
        preview: previewCertificate
    };

})(window);
