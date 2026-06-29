const Question = require("../models/Question");

const questionsData = [
  // ── Section A – Logical & IQ Assessment ──────────────────────────────────
  {
    question: "Agar 5 log 5 ghante me 50 plates prepare karte hain, to 10 log 5 ghante me kitni plates prepare karenge?",
    options: ["50", "75", "100", "125"],
    correctAnswer: 2,
    section: "Logical & IQ Assessment",
    sectionCode: "A",
    targetPositions: ["all"],
    experienceLevels: ["all"]
  },
  {
    question: "Agar har Manager Employee hai aur kuch Employees Supervisors hain, to kya har Manager Supervisor hoga?",
    options: ["Yes", "No", "Kabhi Kabhi", "Data insufficient"],
    correctAnswer: 1,
    section: "Logical & IQ Assessment",
    sectionCode: "A",
    targetPositions: ["all"],
    experienceLevels: ["all"]
  },
  {
    question: "Pattern Complete karo: 2, 4, 8, 16, ?",
    options: ["24", "30", "32", "36"],
    correctAnswer: 2,
    section: "Logical & IQ Assessment",
    sectionCode: "A",
    targetPositions: ["all"],
    experienceLevels: ["all"]
  },
  {
    question: "Agar Monday ke 3 din baad Thursday hai, to Thursday ke 4 din baad kaunsa din hoga?",
    options: ["Monday", "Sunday", "Tuesday", "Friday"],
    correctAnswer: 0,
    section: "Logical & IQ Assessment",
    sectionCode: "A",
    targetPositions: ["all"],
    experienceLevels: ["all"]
  },
  {
    question: "Kaunsa number alag hai?",
    options: ["25", "36", "49", "52"],
    correctAnswer: 3,
    section: "Logical & IQ Assessment",
    sectionCode: "A",
    targetPositions: ["all"],
    experienceLevels: ["all"]
  },
  {
    question: "A prospect says, 'We already have a cafeteria vendor.' What would be your best response?",
    options: [
      "End the call",
      "Ask for a meeting to understand current challenges and explore improvements",
      "Offer a discount immediately",
      "Ask for another contact"
    ],
    correctAnswer: 1,
    section: "Logical & IQ Assessment",
    sectionCode: "A",
    targetPositions: ["all"],
    experienceLevels: ["all"]
  },
  {
    question: "Which metric best indicates the effectiveness of an Appointment Setter?",
    options: ["Number of calls made", "Number of emails sent", "Qualified meetings booked", "Time spent on calls"],
    correctAnswer: 2,
    section: "Logical & IQ Assessment",
    sectionCode: "A",
    targetPositions: ["all"],
    experienceLevels: ["all"]
  },
  {
    question: "What is the most effective way to identify the right decision-maker in a large organization?",
    options: [
      "Call random departments",
      "Check LinkedIn and company website before calling",
      "Send mass emails",
      "Ask the receptionist for all employee details"
    ],
    correctAnswer: 1,
    section: "Logical & IQ Assessment",
    sectionCode: "A",
    targetPositions: ["all"],
    experienceLevels: ["all"]
  },
  {
    question: "If you have 100 leads and limited time, which leads should be prioritized?",
    options: [
      "Oldest leads only",
      "Leads with highest potential and decision-maker access",
      "Leads from small companies only",
      "Leads nearest to office"
    ],
    correctAnswer: 1,
    section: "Logical & IQ Assessment",
    sectionCode: "A",
    targetPositions: ["all"],
    experienceLevels: ["all"]
  },
  {
    question: "A prospect asks, 'Why should I meet your company?' What should your answer focus on?",
    options: [
      "Company age only",
      "Benefits, value proposition, and business outcomes",
      "Lowest pricing only",
      "Number of employees"
    ],
    correctAnswer: 1,
    section: "Logical & IQ Assessment",
    sectionCode: "A",
    targetPositions: ["all"],
    experienceLevels: ["all"]
  },

  // ── Section B – Decision Making ───────────────────────────────────────────
  {
    question: "Client complaint karta hai ki food quality poor thi. Aap kya karenge?",
    options: [
      "Ignore karunga",
      "Staff ko daant dunga",
      "Investigation karke root cause identify karunga aur solution dunga",
      "Client ko blame karunga"
    ],
    correctAnswer: 2,
    section: "Decision Making",
    sectionCode: "B",
    targetPositions: ["all"],
    experienceLevels: ["all"]
  },
  {
    question: "Ek employee baar-baar late aata hai.",
    options: ["Ignore", "Salary kaat do", "Reason samjho, counselling do, phir action lo", "Job se nikal do"],
    correctAnswer: 2,
    section: "Decision Making",
    sectionCode: "B",
    targetPositions: ["all"],
    experienceLevels: ["all"]
  },
  {
    question: "Aapke paas do urgent kaam hain.",
    options: [
      "Random kaam shuru karunga",
      "Jo aasaan ho pehle karunga",
      "Priority aur deadline ke hisaab se kaam karunga",
      "Kisi aur ka wait karunga"
    ],
    correctAnswer: 2,
    section: "Decision Making",
    sectionCode: "B",
    targetPositions: ["all"],
    experienceLevels: ["all"]
  },
  {
    question: "Team target achieve nahi kar pa rahi.",
    options: ["Sabko blame karunga", "Data analyse karke issue identify karunga", "Ignore", "Resign kar dunga"],
    correctAnswer: 1,
    section: "Decision Making",
    sectionCode: "B",
    targetPositions: ["all"],
    experienceLevels: ["all"]
  },
  {
    question: "Customer gusse me hai.",
    options: ["Main bhi argue karunga", "Ignore karunga", "Calm rehkar solution dunga", "Phone cut kar dunga"],
    correctAnswer: 2,
    section: "Decision Making",
    sectionCode: "B",
    targetPositions: ["all"],
    experienceLevels: ["all"]
  },
  {
    question: "What information is most important before scheduling a meeting?",
    options: [
      "Prospect's birthday",
      "Decision-maker name, requirement, current vendor, and business size",
      "Office timings only",
      "LinkedIn followers"
    ],
    correctAnswer: 1,
    section: "Decision Making",
    sectionCode: "B",
    targetPositions: ["all"],
    experienceLevels: ["all"]
  },
  {
    question: "What is the best follow-up sequence after an unanswered call?",
    options: [
      "Stop contacting",
      "Call repeatedly every hour",
      "Call, email/WhatsApp, and schedule another follow-up",
      "Wait one month"
    ],
    correctAnswer: 2,
    section: "Decision Making",
    sectionCode: "B",
    targetPositions: ["all"],
    experienceLevels: ["all"]
  },
  {
    question: "Which question best qualifies a lead?",
    options: [
      "How many employees do you have?",
      "Are you currently managing your cafeteria in-house or through a vendor?",
      "What is your favorite food?",
      "What is your salary?"
    ],
    correctAnswer: 1,
    section: "Decision Making",
    sectionCode: "B",
    targetPositions: ["all"],
    experienceLevels: ["all"]
  },
  {
    question: "What is the purpose of CRM in B2B sales?",
    options: [
      "Store attendance records",
      "Manage and track sales opportunities systematically",
      "Process payroll",
      "Manage inventory"
    ],
    correctAnswer: 1,
    section: "Decision Making",
    sectionCode: "B",
    targetPositions: ["all"],
    experienceLevels: ["all"]
  },
  {
    question: "A prospect is interested but not ready. What should you do?",
    options: [
      "Delete the lead",
      "Keep a structured follow-up plan in CRM",
      "Transfer to another company",
      "Stop communication"
    ],
    correctAnswer: 1,
    section: "Decision Making",
    sectionCode: "B",
    targetPositions: ["all"],
    experienceLevels: ["all"]
  },

  // ── Section C – Integrity ─────────────────────────────────────────────────
  {
    question: "Agar cashier ₹500 extra de de.",
    options: ["Rakh lunga", "Baad me de dunga", "Turant return karunga", "Dekhenge"],
    correctAnswer: 2,
    section: "Integrity",
    sectionCode: "C",
    targetPositions: ["all"],
    experienceLevels: ["all"]
  },
  {
    question: "Boss office me nahi hain aur koi check nahi kar raha.",
    options: ["Mobile use karunga", "Time pass karunga", "Apna kaam continue karunga", "Jaldi ghar chala jaunga"],
    correctAnswer: 2,
    section: "Integrity",
    sectionCode: "C",
    targetPositions: ["all"],
    experienceLevels: ["all"]
  },
  {
    question: "Company ka confidential data.",
    options: [
      "Friends ko dikhaunga",
      "Social media par share karunga",
      "Confidential rakhunga",
      "Ex-employee ko bhej dunga"
    ],
    correctAnswer: 2,
    section: "Integrity",
    sectionCode: "C",
    targetPositions: ["all"],
    experienceLevels: ["all"]
  },
  {
    question: "Galti ho gayi.",
    options: ["Chhupaunga", "Kisi aur par daal dunga", "Accept karke solution dunga", "Ignore karunga"],
    correctAnswer: 2,
    section: "Integrity",
    sectionCode: "C",
    targetPositions: ["all"],
    experienceLevels: ["all"]
  },
  {
    question: "Kisi employee ki salary galti se pata chal gayi.",
    options: ["Sabko bata dunga", "Gossip karunga", "Confidential rakhunga", "WhatsApp par share karunga"],
    correctAnswer: 2,
    section: "Integrity",
    sectionCode: "C",
    targetPositions: ["all"],
    experienceLevels: ["all"]
  },
  {
    question: "Which approach is most effective when facing objections?",
    options: [
      "Interrupt the prospect",
      "Listen, acknowledge, and respond with relevant benefits",
      "Argue",
      "End the call"
    ],
    correctAnswer: 1,
    section: "Integrity",
    sectionCode: "C",
    targetPositions: ["all"],
    experienceLevels: ["all"]
  },
  {
    question: "What is the most valuable outcome of a cold call?",
    options: ["Long conversation", "Qualified next step or meeting", "Sending brochure only", "Getting email ID"],
    correctAnswer: 1,
    section: "Integrity",
    sectionCode: "C",
    targetPositions: ["all"],
    experienceLevels: ["all"]
  },
  {
    question: "Which lead source generally provides the highest quality B2B prospects?",
    options: ["Random databases", "LinkedIn with targeted research", "Social media comments", "Online gaming groups"],
    correctAnswer: 1,
    section: "Integrity",
    sectionCode: "C",
    targetPositions: ["all"],
    experienceLevels: ["all"]
  },
  {
    question: "How would you handle a gatekeeper who refuses access to the decision-maker?",
    options: [
      "Become aggressive",
      "Build rapport and clearly communicate the purpose of the call",
      "Disconnect",
      "Call repeatedly"
    ],
    correctAnswer: 1,
    section: "Integrity",
    sectionCode: "C",
    targetPositions: ["all"],
    experienceLevels: ["all"]
  },
  {
    question: "Which KPI combination is most important for an Appointment Setter?",
    options: [
      "Calls + Qualified Leads + Meetings Booked",
      "Calls + Attendance",
      "Emails + Leaves",
      "Travel + Expenses"
    ],
    correctAnswer: 0,
    section: "Integrity",
    sectionCode: "C",
    targetPositions: ["all"],
    experienceLevels: ["all"]
  },

  // ── Section D – Stress & Work Style ──────────────────────────────────────
  {
    question: "Bahut pressure hai.",
    options: ["Panic", "Kaam chhod dunga", "Plan banaunga aur ek-ek task complete karunga", "Gussa karunga"],
    correctAnswer: 2,
    section: "Stress & Work Style",
    sectionCode: "D",
    targetPositions: ["all"],
    experienceLevels: ["all"]
  },
  {
    question: "Ek din me 100 calls karni hain.",
    options: ["Sirf 20 karunga", "Delay karunga", "Planning ke saath target complete karne ki koshish karunga", "Excuse banaunga"],
    correctAnswer: 2,
    section: "Stress & Work Style",
    sectionCode: "D",
    targetPositions: ["all"],
    experienceLevels: ["all"]
  },
  {
    question: "Kisi ne aapko criticize kiya.",
    options: ["Fight", "Ignore", "Feedback analyse karunga", "Resign"],
    correctAnswer: 2,
    section: "Stress & Work Style",
    sectionCode: "D",
    targetPositions: ["all"],
    experienceLevels: ["all"]
  },
  {
    question: "Team me disagreement hai.",
    options: ["Side le lunga", "Sabko daantunga", "Dono side sununga aur fair decision lunga", "Ignore"],
    correctAnswer: 2,
    section: "Stress & Work Style",
    sectionCode: "D",
    targetPositions: ["all"],
    experienceLevels: ["all"]
  },
  {
    question: "Aapki sabse badi priority kya hogi?",
    options: ["Sirf salary", "Sirf leave", "Achha kaam, learning aur company ka result", "Bas time pass"],
    correctAnswer: 2,
    section: "Stress & Work Style",
    sectionCode: "D",
    targetPositions: ["all"],
    experienceLevels: ["all"]
  },
  {
    question: "What demonstrates strong prospect research before a call?",
    options: [
      "Knowing company industry, size, locations, and likely requirements",
      "Knowing company logo color",
      "Knowing employee birthdays",
      "Knowing social media likes"
    ],
    correctAnswer: 0,
    section: "Stress & Work Style",
    sectionCode: "D",
    targetPositions: ["all"],
    experienceLevels: ["all"]
  },
  {
    question: "If a lead says, 'Send details first,' what should you do?",
    options: [
      "Send details and close the lead",
      "Send details and secure a follow-up date/time",
      "Ignore the request",
      "Ask for pricing approval"
    ],
    correctAnswer: 1,
    section: "Stress & Work Style",
    sectionCode: "D",
    targetPositions: ["all"],
    experienceLevels: ["all"]
  },
  {
    question: "Which statement is most effective in opening a cold call?",
    options: [
      "Do you have two minutes? I would like to understand your cafeteria and food service requirements.",
      "I want to sell you something.",
      "Can you transfer me to the CEO?",
      "Are you busy?"
    ],
    correctAnswer: 0,
    section: "Stress & Work Style",
    sectionCode: "D",
    targetPositions: ["all"],
    experienceLevels: ["all"]
  },
  {
    question: "What is the biggest risk of not updating CRM regularly?",
    options: [
      "Higher electricity bill",
      "Loss of lead history and missed opportunities",
      "More meetings",
      "Faster closures"
    ],
    correctAnswer: 1,
    section: "Stress & Work Style",
    sectionCode: "D",
    targetPositions: ["all"],
    experienceLevels: ["all"]
  },
  {
    question: "A successful Sales Appointer should primarily be evaluated on:",
    options: [
      "Call volume only",
      "Number of qualified meetings leading to sales opportunities",
      "Office attendance",
      "Years of experience"
    ],
    correctAnswer: 1,
    section: "Stress & Work Style",
    sectionCode: "D",
    targetPositions: ["all"],
    experienceLevels: ["all"]
  }
];

async function seedQuestionsIfEmpty() {
  const count = await Question.countDocuments();
  if (count === 0) {
    await Question.insertMany(questionsData);
    console.log(`Seeded ${questionsData.length} questions`);
  } else {
    console.log(`Questions already exist (${count}), skipping seed`);
  }
}

module.exports = { seedQuestionsIfEmpty };
