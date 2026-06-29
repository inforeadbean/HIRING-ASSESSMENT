const questions = [
  // Section A – Logical & IQ Assessment
  {
    id: 1,
    section: "Logical & IQ Assessment",
    sectionCode: "A",
    question: "Agar 5 log 5 ghante me 50 plates prepare karte hain, to 10 log 5 ghante me kitni plates prepare karenge?",
    options: ["50", "75", "100", "125"],
    correctAnswer: 2,
    explanation: "10 log 5 ghante me 100 plates prepare karenge (double workers = double output)"
  },
  {
    id: 2,
    section: "Logical & IQ Assessment",
    sectionCode: "A",
    question: "Agar har Manager Employee hai aur kuch Employees Supervisors hain, to kya har Manager Supervisor hoga?",
    options: ["Yes", "No", "Kabhi Kabhi", "Data insufficient"],
    correctAnswer: 1,
    explanation: "Sirf kuch Employees Supervisors hain, isliye zaroori nahi ki Manager Supervisor ho"
  },
  {
    id: 3,
    section: "Logical & IQ Assessment",
    sectionCode: "A",
    question: "Pattern Complete karo: 2, 4, 8, 16, ?",
    options: ["24", "30", "32", "36"],
    correctAnswer: 2,
    explanation: "Pattern: har number double hota hai (×2)"
  },
  {
    id: 4,
    section: "Logical & IQ Assessment",
    sectionCode: "A",
    question: "Agar Monday ke 3 din baad Thursday hai, to Thursday ke 4 din baad kaunsa din hoga?",
    options: ["Monday", "Sunday", "Tuesday", "Friday"],
    correctAnswer: 0,
    explanation: "Thursday + 4 din = Monday"
  },
  {
    id: 5,
    section: "Logical & IQ Assessment",
    sectionCode: "A",
    question: "Kaunsa number alag hai?",
    options: ["25", "36", "49", "52"],
    correctAnswer: 3,
    explanation: "25, 36, 49 perfect squares hain (5², 6², 7²), lekin 52 perfect square nahi hai"
  },
  // Section B – Decision Making
  {
    id: 6,
    section: "Decision Making",
    sectionCode: "B",
    question: "Client complaint karta hai ki food quality poor thi. Aap kya karenge?",
    options: [
      "Ignore karunga",
      "Staff ko daant dunga",
      "Investigation karke root cause identify karunga aur solution dunga",
      "Client ko blame karunga"
    ],
    correctAnswer: 2,
    explanation: "Root cause identify karna aur solution dena best professional approach hai"
  },
  {
    id: 7,
    section: "Decision Making",
    sectionCode: "B",
    question: "Ek employee baar-baar late aata hai. Aap kya karenge?",
    options: [
      "Ignore",
      "Salary kaat do",
      "Reason samjho, counselling do, phir action lo",
      "Job se nikal do"
    ],
    correctAnswer: 2,
    explanation: "Pehle reason samajhna aur counselling dena fair aur professional approach hai"
  },
  {
    id: 8,
    section: "Decision Making",
    sectionCode: "B",
    question: "Aapke paas do urgent kaam hain. Aap kya karenge?",
    options: [
      "Random kaam shuru karunga",
      "Jo aasaan ho pehle karunga",
      "Priority aur deadline ke hisaab se kaam karunga",
      "Kisi aur ka wait karunga"
    ],
    correctAnswer: 2,
    explanation: "Priority aur deadline ke basis par kaam karna most effective approach hai"
  },
  {
    id: 9,
    section: "Decision Making",
    sectionCode: "B",
    question: "Team target achieve nahi kar pa rahi. Aap kya karenge?",
    options: [
      "Sabko blame karunga",
      "Data analyse karke issue identify karunga",
      "Ignore",
      "Resign kar dunga"
    ],
    correctAnswer: 1,
    explanation: "Data analysis se root cause identify karna effective problem-solving approach hai"
  },
  {
    id: 10,
    section: "Decision Making",
    sectionCode: "B",
    question: "Customer gusse me hai. Aap kya karenge?",
    options: [
      "Main bhi argue karunga",
      "Ignore karunga",
      "Calm rehkar solution dunga",
      "Phone cut kar dunga"
    ],
    correctAnswer: 2,
    explanation: "Calm rehna aur solution dena best customer service practice hai"
  },
  // Section C – Integrity
  {
    id: 11,
    section: "Integrity",
    sectionCode: "C",
    question: "Agar cashier ₹500 extra de de. Aap kya karenge?",
    options: [
      "Rakh lunga",
      "Baad me de dunga",
      "Turant return karunga",
      "Dekhenge"
    ],
    correctAnswer: 2,
    explanation: "Immediately return karna highest integrity dikhata hai"
  },
  {
    id: 12,
    section: "Integrity",
    sectionCode: "C",
    question: "Boss office me nahi hain aur koi check nahi kar raha. Aap kya karenge?",
    options: [
      "Mobile use karunga",
      "Time pass karunga",
      "Apna kaam continue karunga",
      "Jaldi ghar chala jaunga"
    ],
    correctAnswer: 2,
    explanation: "Supervision ke bina bhi kaam karna true professionalism dikhata hai"
  },
  {
    id: 13,
    section: "Integrity",
    sectionCode: "C",
    question: "Company ka confidential data hamare paas hai. Aap kya karenge?",
    options: [
      "Friends ko dikhaunga",
      "Social media par share karunga",
      "Confidential rakhunga",
      "Ex-employee ko bhej dunga"
    ],
    correctAnswer: 2,
    explanation: "Company data hamesha confidential rakhna chahiye"
  },
  {
    id: 14,
    section: "Integrity",
    sectionCode: "C",
    question: "Kaam me galti ho gayi. Aap kya karenge?",
    options: [
      "Chhupaunga",
      "Kisi aur par daal dunga",
      "Accept karke solution dunga",
      "Ignore karunga"
    ],
    correctAnswer: 2,
    explanation: "Galti accept karna aur solution dena highest integrity dikhata hai"
  },
  {
    id: 15,
    section: "Integrity",
    sectionCode: "C",
    question: "Kisi employee ki salary galti se pata chal gayi. Aap kya karenge?",
    options: [
      "Sabko bata dunga",
      "Gossip karunga",
      "Confidential rakhunga",
      "WhatsApp par share karunga"
    ],
    correctAnswer: 2,
    explanation: "Salary information hamesha confidential hoti hai"
  },
  // Section D – Stress & Work Style
  {
    id: 16,
    section: "Stress & Work Style",
    sectionCode: "D",
    question: "Bahut pressure hai aur deadline close hai. Aap kya karenge?",
    options: [
      "Panic karunga",
      "Kaam chhod dunga",
      "Plan banaunga aur ek-ek task complete karunga",
      "Gussa karunga"
    ],
    correctAnswer: 2,
    explanation: "Planning se pressure handle karna best stress management approach hai"
  },
  {
    id: 17,
    section: "Stress & Work Style",
    sectionCode: "D",
    question: "Ek din me 100 calls karni hain. Aap kya karenge?",
    options: [
      "Sirf 20 karunga",
      "Delay karunga",
      "Planning ke saath target complete karne ki koshish karunga",
      "Excuse banaunga"
    ],
    correctAnswer: 2,
    explanation: "Planning ke saath full target achieve karne ki koshish karna best work ethic hai"
  },
  {
    id: 18,
    section: "Stress & Work Style",
    sectionCode: "D",
    question: "Kisi ne aapko criticize kiya. Aap kya karenge?",
    options: [
      "Fight karunga",
      "Ignore karunga",
      "Feedback analyse karunga aur improve karunga",
      "Resign karunga"
    ],
    correctAnswer: 2,
    explanation: "Constructive feedback lena aur improve karna growth mindset dikhata hai"
  },
  {
    id: 19,
    section: "Stress & Work Style",
    sectionCode: "D",
    question: "Team me disagreement hai. Aap kya karenge?",
    options: [
      "Ek side le lunga",
      "Sabko daantunga",
      "Dono side sununga aur fair decision lunga",
      "Ignore karunga"
    ],
    correctAnswer: 2,
    explanation: "Both sides sunna aur fair decision lena best leadership quality hai"
  },
  {
    id: 20,
    section: "Stress & Work Style",
    sectionCode: "D",
    question: "Job me aapki sabse badi priority kya hogi?",
    options: [
      "Sirf salary",
      "Sirf leave",
      "Achha kaam, learning aur company ka result",
      "Bas time pass"
    ],
    correctAnswer: 2,
    explanation: "Kaam, learning aur company goals best professional attitude dikhate hain"
  }
];

module.exports = questions;
