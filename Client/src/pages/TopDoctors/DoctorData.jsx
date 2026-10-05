// Components/Data/DoctorData.jsx

export const doctors = [
  {
    id: 1,
    name: "Dr. Sarah Wilson",
    specialty: "Endocrinology (Diabetes)",
    rating: 4.9,
    reviews: 128,
    experience: "15 Years",
    patients: "2.5k+",
    about: "Dr. Sarah is a leading expert in Type 1 Diabetes management in children and adults. She focuses on integrating technology like CGMs with daily lifestyle changes.",
    // Fixed: Diagram tag on a single line
    bioNote: "", 
    image: "https://img.freepik.com/free-photo/portrait-smiling-handsome-male-doctor-man_171337-5055.jpg",
    category: "Diabetes",
    clinics: [
      { id: 1, name: "Maadi Health Center", address: "Road 9, Maadi, Cairo", price: 400 },
      { id: 2, name: "Nile Care Hospital", address: "Corniche El Nil, Cairo", price: 550 }
    ]
  },
  {
    id: 2,
    name: "Dr. Ahmed Ali",
    specialty: "Cardiology (Blood Pressure)",
    rating: 4.8,
    reviews: 95,
    experience: "12 Years",
    patients: "1.8k+",
    about: "Specializing in hypertension and preventative cardiology. Dr. Ali helps patients manage blood pressure through medication and stress reduction techniques.",
    // Fixed: Diagram tag on a single line
    bioNote: "",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&auto=format&fit=crop&q=60",
    category: "Cardiology",
    clinics: [
      { id: 1, name: "Dokki Heart Center", address: "Tahrir St, Dokki, Giza", price: 350 }
    ]
  },
  {
    id: 3,
    name: "Dr. Mona Hassan",
    specialty: "Endocrinology (Diabetes)",
    rating: 5.0,
    reviews: 210,
    experience: "20 Years",
    patients: "5k+",
    about: "A pioneer in insulin pump therapy training. Dr. Mona has helped thousands of families adapt to life with diabetes.",
    bioNote: "",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=400",
    category: "Diabetes",
    clinics: [
      { id: 1, name: "Smouha Elite Clinic", address: "Victor Emanuel, Alexandria", price: 450 }
    ]
  },
  {
    id: 4,
    name: "Dr. Khaled Omar",
    specialty: "Cardiology (Heart Health)",
    rating: 4.7,
    reviews: 84,
    experience: "8 Years",
    patients: "900+",
    about: "Expert in interventional cardiology and heart failure management. Committed to accessible heart health education.",
    bioNote: "",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400",
    category: "Cardiology",
    clinics: [
      { id: 1, name: "Nasr City Cardio", address: "Abbas El Akkad, Cairo", price: 300 }
    ]
  },
  {
    id: 5,
    name: "Dr. Laila Samir",
    specialty: "General Medicine",
    rating: 4.9,
    reviews: 150,
    experience: "10 Years",
    patients: "3k+",
    about: "Providing comprehensive family care and initial diagnosis for a wide range of medical conditions.",
    bioNote: "",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400",
    category: "General",
    clinics: [
      { id: 1, name: "Heliopolis Family Clinic", address: "Korba, Cairo", price: 250 }
    ]
  },
  {
    id: 6,
    name: "Dr. Omar Youssef",
    specialty: "Nephrology (Kidney & BP)",
    rating: 4.6,
    reviews: 60,
    experience: "14 Years",
    patients: "1.2k+",
    about: "Focusing on the link between high blood pressure and kidney health (Nephrology).",
    bioNote: "",
    image: "https://images.unsplash.com/photo-1537368910025-4003508ce5ba?auto=format&fit=crop&q=80&w=400",
    category: "Blood Pressure",
    clinics: [
      { id: 1, name: "Mohandessin Kidney Center", address: "Gamaa Dol, Giza", price: 500 }
    ]
  }
];