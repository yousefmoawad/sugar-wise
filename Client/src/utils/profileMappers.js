/**
 * موحد بيانات الطبيب والمريض لضمان عرض نفس الداتا في كل الصفحات
 * تم تحسينه ليكون متوافقاً مع هيكلية الـ API الموحدة للويب والموبايل
 */

const getFullImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  // في حالة الموبايل، قد تحتاج لإضافة الـ Base URL الخاص بالسيرفر هنا
  return `${path}`; 
};

export const toViewDoctor = (d) => {
  if (!d) return d;
  const name = d.name || `${d.firstName || ""} ${d.lastName || ""}`.trim() || "Doctor";
  const specialty = d.specialty || d.medicalSpecialty || "";
  
  const rawReviews = d.ratingCount ?? d.reviewsCount ?? d.reviews ?? d.followersCount;
  const reviews = rawReviews !== undefined ? Number(rawReviews) : undefined;

  const rawRating = d.averageRating ?? d.rating ?? d.rate;
  const averageRating = rawRating !== undefined ? Number(rawRating) : undefined;

  const rawUserRating = d.currentUserRating ?? d.userRate;
  const currentUserRating = rawUserRating !== undefined ? Number(rawUserRating) : undefined;

  const image = getFullImageUrl(d.image || d.profileImage || "");
  const about = d.about || d.bio || "";
  
  const clinics = Array.isArray(d.clinics) && d.clinics.length > 0
    ? d.clinics
    : [{
        id: `${d._id || d.id || "default"}-clinic-1`,
        name: `${name} Clinic`,
        address: d.address || "No address available",
        price: d.price || 300,
        selectedDays: d.selectedDays || (d.workingDays ? d.workingDays : ["sun", "mon"]),
        maxCasesPerDay: d.maxCasesPerDay || 20,
        coords: d.coords || { lat: 30.0444, lng: 31.2357 },
      }];

  return { 
    ...d, 
    name, 
    specialty, 
    reviews, 
    rating: averageRating, 
    averageRating, 
    currentUserRating,
    image, 
    about, 
    clinics 
  };
};

export const toViewPatient = (p) => {
  if (!p) return p;
  return {
    ...p,
    name: `${p.firstName || ""} ${p.lastName || ""}`.trim() || "Patient",
    displayWeight: p.weight ? `${p.weight} kg` : "N/A",
    displayHeight: p.height ? `${p.height} cm` : "N/A",
    image: getFullImageUrl(p.profileImage || p.image || "https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg")
  };
};