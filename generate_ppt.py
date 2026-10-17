import sys
import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def create_deck():
    prs = Presentation()
    # 16:9 Widescreen slides
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Brand Colors
    DARK_NAVY = RGBColor(15, 23, 42)       # #0f172a
    PRIMARY_INDIGO = RGBColor(79, 70, 229) # #4f46e5
    ACCENT_BLUE = RGBColor(37, 99, 235)    # #2563eb
    TEXT_DARK = RGBColor(30, 41, 59)       # #1e293b
    TEXT_MUTED = RGBColor(100, 116, 139)   # #64748b
    CARD_BG = RGBColor(248, 250, 252)      # #f8fafc
    CARD_BORDER = RGBColor(226, 232, 240)  # #e2e8f0
    WHITE = RGBColor(255, 255, 255)
    GREEN = RGBColor(16, 185, 129)
    RED = RGBColor(239, 68, 68)

    def add_header(slide, title_text, category_text="CAMPUS EVENT & CROWDFUNDING PLATFORM"):
        # Category / Pill
        cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.7), Inches(0.4))
        tf_cat = cat_box.text_frame
        tf_cat.word_wrap = True
        p_cat = tf_cat.paragraphs[0]
        p_cat.text = category_text.upper()
        p_cat.font.size = Pt(9.5)
        p_cat.font.bold = True
        p_cat.font.color.rgb = PRIMARY_INDIGO

        # Main Slide Title
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.7), Inches(11.7), Inches(0.8))
        tf_title = title_box.text_frame
        tf_title.word_wrap = True
        p_title = tf_title.paragraphs[0]
        p_title.text = title_text
        p_title.font.size = Pt(22)
        p_title.font.bold = True
        p_title.font.color.rgb = DARK_NAVY

    def add_card(slide, left, top, width, height, title, body_bullets, title_color=PRIMARY_INDIGO, bg_color=CARD_BG, border_color=CARD_BORDER):
        shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        shape.fill.solid()
        shape.fill.fore_color.rgb = bg_color
        shape.line.color.rgb = border_color
        shape.line.width = Pt(1.5)

        tf = shape.text_frame
        tf.word_wrap = True
        tf.margin_left = Inches(0.25)
        tf.margin_right = Inches(0.25)
        tf.margin_top = Inches(0.25)
        tf.margin_bottom = Inches(0.25)

        # Title
        p_title = tf.paragraphs[0]
        p_title.text = title
        p_title.font.size = Pt(13)
        p_title.font.bold = True
        p_title.font.color.rgb = title_color
        p_title.space_after = Pt(8)

        # Bullets
        for b in body_bullets:
            p = tf.add_paragraph()
            p.text = "• " + b
            p.font.size = Pt(10.5)
            p.font.color.rgb = TEXT_DARK
            p.space_after = Pt(5)

    # ==================== SLIDE 1: TITLE SLIDE ====================
    slide1 = prs.slides.add_slide(blank_layout)
    
    # Top decorative banner bar
    top_bar = slide1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(0.15))
    top_bar.fill.solid()
    top_bar.fill.fore_color.rgb = PRIMARY_INDIGO
    top_bar.line.fill.background()

    # Title box
    t_box = slide1.shapes.add_textbox(Inches(1.0), Inches(1.8), Inches(11.3), Inches(2.2))
    tf1 = t_box.text_frame
    tf1.word_wrap = True
    
    p_badge = tf1.paragraphs[0]
    p_badge.text = "COLLEGE ITW WORKSHOP PROJECT".upper()
    p_badge.font.size = Pt(11)
    p_badge.font.bold = True
    p_badge.font.color.rgb = PRIMARY_INDIGO
    p_badge.space_after = Pt(12)

    p_main = tf1.add_paragraph()
    p_main.text = "Campus Event & Crowdfunding Platform"
    p_main.font.size = Pt(34)
    p_main.font.bold = True
    p_main.font.color.rgb = DARK_NAVY
    p_main.space_after = Pt(12)

    p_sub = tf1.add_paragraph()
    p_sub.text = "An all-in-one web portal featuring atomic seat booking, zero double-booking,\nin-browser QR scanning, verified certificates & festival crowdfunding."
    p_sub.font.size = Pt(14)
    p_sub.font.color.rgb = TEXT_MUTED

    # Bottom Meta Card
    meta_shape = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.0), Inches(4.7), Inches(11.333), Inches(1.6))
    meta_shape.fill.solid()
    meta_shape.fill.fore_color.rgb = CARD_BG
    meta_shape.line.color.rgb = CARD_BORDER
    meta_tf = meta_shape.text_frame
    meta_tf.word_wrap = True
    meta_tf.margin_left = Inches(0.3)
    meta_tf.margin_top = Inches(0.25)
    
    mp1 = meta_tf.paragraphs[0]
    mp1.text = "Technology Stack & Core Specifications"
    mp1.font.size = Pt(11.5)
    mp1.font.bold = True
    mp1.font.color.rgb = DARK_NAVY
    mp1.space_after = Pt(6)

    mp2 = meta_tf.add_paragraph()
    mp2.text = "Frontend: HTML5, Tailwind CSS, Vanilla JavaScript (Single Page Architecture, Mobile Responsive)\nDatabase & Auth: Supabase (PostgreSQL 15), ACID Row-Level Security | Payments: Razorpay Serverless Node.js APIs\nHardware Integration: WebRTC Camera Barcode Scanning | Graphics: Client-Side HTML5 Canvas Vector Engine"
    mp2.font.size = Pt(10)
    mp2.font.color.rgb = TEXT_MUTED

    # ==================== SLIDE 2: PROBLEM STATEMENT ====================
    slide2 = prs.slides.add_slide(blank_layout)
    add_header(slide2, "The Problem: Why Traditional College Events Fail")

    add_card(slide2, Inches(0.8), Inches(1.8), Inches(3.6), Inches(4.8), 
             "1. Messy Google Forms & WhatsApp", 
             [
                 "Clubs collect registrations via unstructured Google Forms.",
                 "Students send payment screenshots on WhatsApp groups.",
                 "Organizers waste hours manually cross-checking bank SMS and UTR numbers.",
                 "Frequent human errors and lost records."
             ], title_color=RED)

    add_card(slide2, Inches(4.8), Inches(1.8), Inches(3.6), Inches(4.8), 
             "2. Fake Tickets & Proxy Attendance", 
             [
                 "No reliable check-in at the auditorium door.",
                 "Students forward PDF passes or screenshot QR codes to friends for free entry.",
                 "Certificates of Participation are awarded to students who skipped the event.",
                 "Devalues college academic credentials."
             ], title_color=RED)

    add_card(slide2, Inches(8.8), Inches(1.8), Inches(3.6), Inches(4.8), 
             "3. Fragmented Festival Fundraising", 
             [
                 "Seniors asking for festival donations (Navratri, Farewell) rely on cash collection.",
                 "Zero transparency on how much money was raised versus the target goal.",
                 "Double-booking during popular paid workshops when the last ticket sells out."
             ], title_color=RED)

    # ==================== SLIDE 3: THE SOLUTION ====================
    slide3 = prs.slides.add_slide(blank_layout)
    add_header(slide3, "Our Solution: A Unified Campus Event Operating System")

    add_card(slide3, Inches(0.8), Inches(1.8), Inches(5.6), Inches(2.3),
             "🎟️ 1. Smart Ticketing & Zero Double-Booking",
             [
                 "Real-time event discovery with 0ms client-side search & filtering.",
                 "Database row-locks prevent overselling the last seat.",
                 "Automated instant refunds if payment completes after seats sell out."
             ], title_color=PRIMARY_INDIGO)

    add_card(slide3, Inches(6.8), Inches(1.8), Inches(5.6), Inches(2.3),
             "💖 2. Transparent Fest Crowdfunding",
             [
                 "Dedicated donation campaigns for campus festivals (Navratri, Farewell).",
                 "Live animated progress bar showing funds raised vs goal.",
                 "Accepts custom variable amounts (₹50, ₹100, ₹500) via Razorpay UPI."
             ], title_color=PRIMARY_INDIGO)

    add_card(slide3, Inches(0.8), Inches(4.4), Inches(5.6), Inches(2.3),
             "📷 3. In-Browser Gatekeeper Scanner",
             [
                 "Volunteers use their smartphone cameras directly in the browser.",
                 "No APK installation required; validates QR codes in under 1 second.",
                 "Detects already-used passes instantly to eliminate proxy attendance."
             ], title_color=PRIMARY_INDIGO)

    add_card(slide3, Inches(6.8), Inches(4.4), Inches(5.6), Inches(2.3),
             "🎓 4. Verified Participation Certificates",
             [
                 "Proof-of-attendance lock: certificates stay locked for no-shows.",
                 "Unlocked only when the ticket is physically scanned at the door.",
                 "Rendered in-browser at 300 DPI print quality with zero server cost."
             ], title_color=PRIMARY_INDIGO)

    # ==================== SLIDE 4: ARCHITECTURE & TECH STACK ====================
    slide4 = prs.slides.add_slide(blank_layout)
    add_header(slide4, "System Architecture: Decoupled & Serverless Stack")

    add_card(slide4, Inches(0.8), Inches(1.8), Inches(2.7), Inches(4.8),
             "Frontend Client",
             [
                 "HTML5 & Tailwind CSS",
                 "Vanilla ES6+ JavaScript",
                 "Zero framework bloat",
                 "100% Mobile responsive",
                 "Dark & Light mode engine",
                 "Single Page Router",
                 "Off-screen Canvas Graphics"
             ], title_color=ACCENT_BLUE)

    add_card(slide4, Inches(3.8), Inches(1.8), Inches(2.7), Inches(4.8),
             "Cloud Database",
             [
                 "Supabase (PostgreSQL 15)",
                 "Row-Level Security (RLS)",
                 "Pessimistic Row Locks",
                 "Atomic Stored Procedures",
                 "Real-time event subscriptions",
                 "Supabase CDN Object Storage",
                 "Automated profile hydration"
             ], title_color=PRIMARY_INDIGO)

    add_card(slide4, Inches(6.8), Inches(1.8), Inches(2.7), Inches(4.8),
             "Payment Gateway",
             [
                 "Razorpay Checkout SDK",
                 "UPI / GPay / Paytm / Cards",
                 "Serverless API endpoints",
                 "HMAC-SHA256 Signatures",
                 "Optimum Speed Refund API",
                 "Secret Key encapsulation",
                 "Paise integer precision"
             ], title_color=GREEN)

    add_card(slide4, Inches(9.8), Inches(1.8), Inches(2.7), Inches(4.8),
             "Hardware & Optics",
             [
                 "WebRTC MediaStream API",
                 "Rear Camera (environment)",
                 "jsQR frame parsing at 60 FPS",
                 "Concurrency debounce lock",
                 "128-bit UUID QR payload",
                 "html2canvas DOM capture",
                 "Chart.js visual analytics"
             ], title_color=DARK_NAVY)

    # ==================== SLIDE 5: FEATURE DEEP DIVE 1 ====================
    slide5 = prs.slides.add_slide(blank_layout)
    add_header(slide5, "Deep Dive: Concurrency, Seat Locking & Auto-Refunds")

    add_card(slide5, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8),
             "The Double-Booking Problem",
             [
                 "The Scenario: An event has only 1 remaining seat.",
                 "Two students click 'Pay' at the exact same millisecond.",
                 "In standard websites, both payments succeed, causing seat clashes and furious attendees.",
                 "",
                 "Our Solution: Database Row Locks",
                 "We created a PostgreSQL stored procedure (book_ticket_safe).",
                 "It locks the event row with 'SELECT ... FOR UPDATE'.",
                 "Student A's transaction decrements seats to 0 and claims the pass.",
                 "Student B's transaction waits in queue, reads 0, and immediately aborts with error: 'SOLD_OUT'."
             ], title_color=DARK_NAVY)

    add_card(slide5, Inches(6.8), Inches(1.8), Inches(5.6), Inches(4.8),
             "Automated Circuit-Breaker Refund API",
             [
                 "What about Student B's deducted money?",
                 "Because Student B already paid on Razorpay before the seat check completed, their funds were debited.",
                 "",
                 "Instant Reversal Flow:",
                 "1. Frontend catches 'SOLD_OUT' exception from database.",
                 "2. Immediately calls backend POST /api/refund-payment.",
                 "3. Instructs Razorpay API to process an Instant Refund (speed: optimum).",
                 "4. Money is reversed immediately to the student's UPI or card.",
                 "5. Screen shows a reassuring modal with the Refund Reference ID.",
                 "Result: Zero financial disputes, zero manual work for organizers."
             ], title_color=GREEN)

    # ==================== SLIDE 6: FEATURE DEEP DIVE 2 ====================
    slide6 = prs.slides.add_slide(blank_layout)
    add_header(slide6, "Deep Dive: Zero-Trust QR Check-In & Gatekeeper Scanner")

    add_card(slide6, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8),
             "Why Simple QR Codes are Insecure",
             [
                 "Flaw in naive systems: Putting student name or 'ADMIT 1' inside the QR code.",
                 "Any student can use a free online QR generator to create fake passes or alter details in Photoshop.",
                 "",
                 "Our Cryptographic Architecture:",
                 "• The QR code encodes only a random 128-bit Ticket UUID.",
                 "• Contains zero readable personal text.",
                 "• The scanner performs an authenticated lookup in the database to verify the UUID.",
                 "• Fake tickets fail immediately during UUID validation."
             ], title_color=DARK_NAVY)

    add_card(slide6, Inches(6.8), Inches(1.8), Inches(5.6), Inches(4.8),
             "Smartphone Web Scanner & Anti-Proxy Gate",
             [
                 "Hardware Rear Camera Integration:",
                 "• Uses WebRTC facingMode: 'environment' directly in mobile browsers.",
                 "• No APK installation required for student volunteers.",
                 "",
                 "Frame Mutex Lock (isProcessing):",
                 "• Video camera runs at 60 FPS.",
                 "• A debounce mutex flag pauses decoding for 2 seconds to prevent 50 duplicate network hits per second.",
                 "",
                 "Anti-Duplication Alert:",
                 "• If a pass was already scanned: flashes RED with 'ALREADY USED'.",
                 "• If valid: flashes GREEN, plays success chime, and displays attendee details."
             ], title_color=PRIMARY_INDIGO)

    # ==================== SLIDE 7: FEATURE DEEP DIVE 3 ====================
    slide7 = prs.slides.add_slide(blank_layout)
    add_header(slide7, "Deep Dive: Verified Certificates & Crowdfunding")

    add_card(slide7, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8),
             "Smart Proof-of-Attendance Certificates",
             [
                 "The Problem: Students collect certificates without ever attending events.",
                 "",
                 "Our Gatekeeping Logic:",
                 "• Database tracks 'is_scanned' status for every ticket.",
                 "• If attendee was absent: button is locked (🔒 Certificate Locked).",
                 "• If attendee checked in at the door: button is instantly unlocked.",
                 "",
                 "Zero-Backend Canvas Graphics Engine:",
                 "• Renders certificate on an off-screen HTML5 Canvas.",
                 "• High resolution: 1600 × 1130 pixels (~300 DPI print quality).",
                 "• Procedural Guilloche mathematical security seal.",
                 "• Smooth Bézier curve faculty signatures.",
                 "• Renders in <80 milliseconds with zero cloud server cost!"
             ], title_color=PRIMARY_INDIGO)

    add_card(slide7, Inches(6.8), Inches(1.8), Inches(5.6), Inches(4.8),
             "Festival Crowdfunding (Navratri / Farewell)",
             [
                 "Moving Campus Cash Collections Online:",
                 "• Dedicated 'Donations' category alongside workshops & sports.",
                 "• Seniors & collegiate clubs can launch campaigns for cultural fests.",
                 "",
                 "Dynamic Variable Contribution:",
                 "• Unlike fixed-seat events, crowdfunding has no seat limit.",
                 "• Contributors can donate any custom amount (₹50, ₹100, ₹500, etc.).",
                 "• Razorpay payment gateway processes donations smoothly.",
                 "",
                 "Live Community Progress:",
                 "• Real-time progress bar shows Current Raised vs Goal Target.",
                 "• Complete transparency for students and faculty coordinators."
             ], title_color=GREEN)

    # ==================== SLIDE 8: ORGANIZER & ADMIN SUITE ====================
    slide8 = prs.slides.add_slide(blank_layout)
    add_header(slide8, "Organizer Suite: Role Delegation, Charts & CSV Export")

    add_card(slide8, Inches(0.8), Inches(1.8), Inches(3.6), Inches(4.8),
             "1. Volunteer Scanner Delegation",
             [
                 "Organizers need junior volunteers to scan tickets at entry.",
                 "Giving volunteers admin passwords is a security risk.",
                 "Our Fix: SECURITY DEFINER RPC.",
                 "Organizers assign volunteers by student email.",
                 "Volunteers get permission ONLY to scan tickets for that single event."
             ], title_color=PRIMARY_INDIGO)

    add_card(slide8, Inches(4.8), Inches(1.8), Inches(3.6), Inches(4.8),
             "2. Demographic Visualizations",
             [
                 "Powered by Chart.js for real-time visual insights.",
                 "Gender Diversity: Donut chart of Male vs Female participants.",
                 "Department Breakdown: Bar chart of CSE, ECE, Mech, Civil registrations.",
                 "Academic Year: Polar area chart showing 1st to 4th-year engagement."
             ], title_color=ACCENT_BLUE)

    add_card(slide8, Inches(8.8), Inches(1.8), Inches(3.6), Inches(4.8),
             "3. Sanitized Excel CSV Export",
             [
                 "1-click export of verified attendance lists.",
                 "Formatted timestamps converted to Indian Standard Time (IST).",
                 "Security Feature: CSV formula injection sanitization.",
                 "Prepends an apostrophe to inputs starting with '=', '+', '-', '@' to prevent spreadsheet macro exploits."
             ], title_color=GREEN)

    # ==================== SLIDE 9: LIVE DEMO FLOW ====================
    slide9 = prs.slides.add_slide(blank_layout)
    add_header(slide9, "Step-by-Step Live Demonstration Walkthrough")

    add_card(slide9, Inches(0.8), Inches(1.8), Inches(2.2), Inches(4.8),
             "Step 1: Discover",
             [
                 "Open Home Portal.",
                 "Use 0ms live search and category chips.",
                 "Toggle Dark / Light mode.",
                 "Inspect festival crowdfunding campaign."
             ], title_color=PRIMARY_INDIGO)

    add_card(slide9, Inches(3.2), Inches(1.8), Inches(2.2), Inches(4.8),
             "Step 2: Book",
             [
                 "Select paid fest or workshop.",
                 "Trigger Razorpay checkout modal.",
                 "Complete payment via UPI test card.",
                 "Database updates seats atomically."
             ], title_color=ACCENT_BLUE)

    add_card(slide9, Inches(5.6), Inches(1.8), Inches(2.2), Inches(4.8),
             "Step 3: Wallet",
             [
                 "Navigate to My Wallet.",
                 "View perforated movie-style ticket.",
                 "Inspect secure UUID QR code.",
                 "Save pass as PNG or sync to Google Calendar."
             ], title_color=GREEN)

    add_card(slide9, Inches(8.0), Inches(1.8), Inches(2.2), Inches(4.8),
             "Step 4: Check-In",
             [
                 "Volunteer opens Scanner on smartphone.",
                 "Scan attendee QR code.",
                 "Green alert: Access Granted + Beep chime.",
                 "Scan again: Red alert: Already Used!"
             ], title_color=DARK_NAVY)

    add_card(slide9, Inches(10.4), Inches(1.8), Inches(2.2), Inches(4.8),
             "Step 5: Verify",
             [
                 "Attendee visits History portal.",
                 "Check-in verified: Certificate unlocks.",
                 "Download 300 DPI canvas certificate.",
                 "Post 5-star verified attendee review."
             ], title_color=PRIMARY_INDIGO)

    # ==================== SLIDE 10: VIVA QUESTIONS & DEFENSE ====================
    slide10 = prs.slides.add_slide(blank_layout)
    add_header(slide10, "Viva Defense: How We Answer Tough Questions")

    add_card(slide10, Inches(0.8), Inches(1.8), Inches(5.6), Inches(2.3),
             "Q1: Can someone enter with a ticket screenshot?",
             [
                 "Answer: No. The QR contains only a unique ticket UUID.",
                 "The moment the first person is scanned, the database marks it as 'Already Used'.",
                 "Any forwarded screenshot flashes a RED warning on the volunteer's scanner."
             ], title_color=DARK_NAVY)

    add_card(slide10, Inches(6.8), Inches(1.8), Inches(5.6), Inches(2.3),
             "Q2: How is double-booking prevented during fests?",
             [
                 "Answer: PostgreSQL row-level locks (book_ticket_safe RPC).",
                 "Concurrent requests wait in queue; only 1 claims the last seat.",
                 "If payment completes for an oversold seat, our backend calls Razorpay's API for an instant auto-refund."
             ], title_color=PRIMARY_INDIGO)

    add_card(slide10, Inches(0.8), Inches(4.4), Inches(5.6), Inches(2.3),
             "Q3: Why a browser scanner instead of an Android APK?",
             [
                 "Answer: College volunteers change for every event.",
                 "Installing APKs on 20 student phones causes delays.",
                 "Our web scanner runs instantly on mobile Chrome/Safari with zero installation."
             ], title_color=ACCENT_BLUE)

    add_card(slide10, Inches(6.8), Inches(4.4), Inches(5.6), Inches(2.3),
             "Q4: How do you verify payment authenticity?",
             [
                 "Answer: The client browser never decides payment validity.",
                 "Serverless API (api/verify-payment.js) calculates an HMAC-SHA256 signature using our secret key to verify the bank receipt."
             ], title_color=GREEN)

    # ==================== SLIDE 11: IMPACT & FUTURE SCOPE ====================
    slide11 = prs.slides.add_slide(blank_layout)
    add_header(slide11, "Campus Impact & Future Roadmap")

    add_card(slide11, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8),
             "Immediate Campus Impact",
             [
                 "100% Paperless Ticketing: Eliminates paper passes, wristbands, and printed rosters.",
                 "Zero Proxy Attendance: Guarantees authentic participation records for college NAAC/NBA accreditations.",
                 "Transparent Fest Finances: All ticket revenues and student donations are tracked digitally with zero cash leakage.",
                 "Instant Verification: Students download official certificates immediately without queuing at club desks."
             ], title_color=PRIMARY_INDIGO)

    add_card(slide11, Inches(6.8), Inches(1.8), Inches(5.6), Inches(4.8),
             "Future Engineering Roadmap",
             [
                 "Inter-College Pass Federation: Single sign-on for visiting colleges during inter-university fests.",
                 "NFC Campus Smartcard Tap: Enable student ID cards to act as tickets via Web-NFC.",
                 "Automated WhatsApp Ticket Delivery: Forward digital passes and calendar reminders via WhatsApp Business API.",
                 "AI-Powered Fest Recommendations: Suggest workshops based on student branch and past attendance."
             ], title_color=ACCENT_BLUE)

    # ==================== SLIDE 12: CONCLUSION ====================
    slide12 = prs.slides.add_slide(blank_layout)
    
    # Header bar
    top_bar12 = slide12.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(0.15))
    top_bar12.fill.solid()
    top_bar12.fill.fore_color.rgb = PRIMARY_INDIGO
    top_bar12.line.fill.background()

    # Center card
    c_shape = slide12.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(2.0), Inches(1.8), Inches(9.333), Inches(4.2))
    c_shape.fill.solid()
    c_shape.fill.fore_color.rgb = CARD_BG
    c_shape.line.color.rgb = CARD_BORDER
    c_tf = c_shape.text_frame
    c_tf.word_wrap = True
    c_tf.margin_left = Inches(0.5)
    c_tf.margin_top = Inches(0.5)

    cp1 = c_tf.paragraphs[0]
    cp1.text = "CONCLUSION"
    cp1.font.size = Pt(12)
    cp1.font.bold = True
    cp1.font.color.rgb = PRIMARY_INDIGO
    cp1.space_after = Pt(10)

    cp2 = c_tf.add_paragraph()
    cp2.text = "Campus Event & Crowdfunding Platform"
    cp2.font.size = Pt(28)
    cp2.font.bold = True
    cp2.font.color.rgb = DARK_NAVY
    cp2.space_after = Pt(12)

    cp3 = c_tf.add_paragraph()
    cp3.text = "A complete, production-ready solution solving real campus problems: seamless ticket discovery, zero double-booking, smartphone QR check-in, transparent fest fundraising, and tamper-proof participation certificates."
    cp3.font.size = Pt(12)
    cp3.font.color.rgb = TEXT_DARK
    cp3.space_after = Pt(20)

    cp4 = c_tf.add_paragraph()
    cp4.text = "Thank You! We are open for Questions & Answers."
    cp4.font.size = Pt(15)
    cp4.font.bold = True
    cp4.font.color.rgb = PRIMARY_INDIGO

    output_path = os.path.join(os.getcwd(), "CAMPUS_EVENT_PLATFORM_PRESENTATION.pptx")
    prs.save(output_path)
    print(f"Presentation saved successfully to: {output_path}")

if __name__ == "__main__":
    create_deck()
