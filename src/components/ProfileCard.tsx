import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient.ts";

type Onboarding = {
  id: string;
  user_id: string;
  full_name?: string;
  date_of_birth?: string;
  gender?: string;
  weight_kg?: number;
  height_cm?: number;
  location?: string;
  blood_group?: string;
  smoker?: boolean;
  alcohol_drinker?: boolean;
  long_term_condition?: string;
  long_term_medication?: string;
  family_history?: string;
};

type ThreeDayCheckin = {
  id: string;
  user_id: string;
  sleep_hours_numeric?: number;
  mood_numeric?: number;
  what_stresses_you_numeric?: number;
  exercise_level_numeric?: number;
  energy_level_numeric?: number;
  meals_today_numeric?: number;
  any_headache_numeric?: number;
  created_at: string;
};

type MentalHealthAssessment = {
  id: string;
  user_id: string;
  feeling_today?: string;
  stress_anxiety_overwhelm?: string;
  created_at: string;
};

type Medication = {
  id: string;
  user_id: string;
  medication_name?: string;
  dosage?: string;
};

export default function PatientProfileSummary({ userId }: { userId?: string }) {
  const [onboarding, setOnboarding] = useState<Onboarding | null>(null);
  const [threeDayCheckin, setThreeDayCheckin] = useState<ThreeDayCheckin | null>(null);
  const [mentalAssessment, setMentalAssessment] = useState<MentalHealthAssessment | null>(null);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllData(actualUserId: string) {
      try {
        const { data: onboardingData, error: onboardingError } = await supabase
          .from("onboarding")
          .select("*")
          .eq("user_id", actualUserId)
          .single();

        if (onboardingError) console.error("Onboarding error:", onboardingError);

        const { data: threeDayData, error: threeDayError } = await supabase
          .from("three_day_checkins")
          .select("*")
          .eq("user_id", actualUserId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (threeDayError) console.error("Three day checkin error:", threeDayError);

        const { data: mentalData, error: mentalError } = await supabase
          .from("mental_health_assessments")
          .select("*")
          .eq("user_id", actualUserId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (mentalError) console.error("Mental health error:", mentalError);

        const { data: medsData, error: medsError } = await supabase
          .from("medications")
          .select("*")
          .eq("user_id", actualUserId);

        if (medsError) console.error("Medications error:", medsError);

        setOnboarding(onboardingData);
        setThreeDayCheckin(threeDayData);
        setMentalAssessment(mentalData);
        setMedications(medsData || []);

      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    }

    async function getUserId() {
      if (userId) {
        fetchAllData(userId);
        return;
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        fetchAllData(user.id);
      } else {
        setLoading(false);
      }
    }

    getUserId();
  }, [userId]);

  if (loading) return <p>Loading patient profile...</p>;

  const calculateAge = (dateOfBirth: string) => {
    try {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      
      if (isNaN(birthDate.getTime())) {
        return "Invalid date";
      }
      
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age;
    } catch (error) {
      console.error("Error calculating age:", error);
      return "N/A";
    }
  };

  const calculateBMI = (weightKg?: number, heightCm?: number) => {
    if (!weightKg || !heightCm || weightKg <= 0 || heightCm <= 0) {
      return { bmi: null, category: "N/A" };
    }

    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);
    const roundedBMI = Math.round(bmi * 10) / 10;

    let category = "";
    if (bmi < 18.5) category = "Underweight";
    else if (bmi < 25) category = "Normal weight";
    else if (bmi < 30) category = "Overweight";
    else if (bmi < 35) category = "Obesity Class I";
    else if (bmi < 40) category = "Obesity Class II";
    else category = "Obesity Class III";

    return { bmi: roundedBMI, category };
  };

  const getBMIColor = (bmi: number) => {
    if (bmi < 18.5) return '#FFD700';
    if (bmi < 25) return '#00FF00';
    if (bmi < 30) return '#FFA500';
    return '#FF0000';
  };

  const colors = {
    darkPurple: '#4A00E0',
    purple: '#8E2DE2',
    darkBlue: '#16213E',
    navy: '#1a1a2e',
    lightPurple: '#9370DB',
    blue: '#4169E1',
    lightBlue: '#6495ED',
    steelBlue: '#4682B4',
    darkSlate: '#2F4F4F',
    slate: '#2C3E50',
    cadetBlue: '#5F9EA0',
    lightCyan: '#E0FFFF',
    lightSteel: '#B0C4DE',
    slateGray: '#708090',
    thistle: '#D8BFD8',
    plum: '#BA55D3',
    darkOrchid: '#9932CC',
    indigo: '#4B0082',
    darkSlateBlue: '#483D8B',
    darkBlue2: '#2C3E76',
    darkerBlue: '#34495E'
  };

  const { bmi, category } = calculateBMI(onboarding?.weight_kg, onboarding?.height_cm);

  return (
    <div style={{ 
      padding: '1rem', 
      fontFamily: 'Arial, sans-serif', 
      maxWidth: '900px', 
      margin: '0 auto', 
      background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.darkBlue} 50%, ${colors.darkerBlue} 100%)`, 
      color: '#e2e2e2', 
      minHeight: '100vh' 
    }}>
      
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '2rem', 
        padding: '2rem 0', 
        background: `linear-gradient(135deg, ${colors.darkPurple} 0%, ${colors.purple} 100%)`, 
        borderRadius: '15px', 
        boxShadow: '0 10px 30px rgba(142, 45, 226, 0.3)' 
      }}>
        <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold', color: '#ffffff', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
          🏥 PATIENT PROFILE
        </h1>
        <p style={{ margin: '0.5rem 0 0 0', color: colors.thistle, fontSize: '1.1rem' }}>
          Comprehensive Health Overview
        </p>
      </div>

      {onboarding && (
        <div style={{ 
          marginBottom: '2.5rem', 
          padding: '2rem', 
          border: `3px solid ${colors.purple}`, 
          borderRadius: '20px', 
          background: `linear-gradient(145deg, #2D2D4D 0%, #3D3D6B 100%)`, 
          boxShadow: '0 8px 25px rgba(142, 45, 226, 0.25)' 
        }}>
          <h3 style={{ 
            color: '#BF40BF', 
            marginBottom: '1.5rem', 
            fontSize: '1.8rem', 
            fontWeight: 'bold', 
            textAlign: 'center', 
            textShadow: '1px 1px 2px rgba(0,0,0,0.7)' 
          }}>
            👤 WHO IS {onboarding.full_name?.toUpperCase() || "THIS PATIENT"}?
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <div style={{ padding: '1.2rem', background: 'rgba(74, 0, 224, 0.15)', borderRadius: '12px', border: `1px solid ${colors.darkOrchid}` }}>
              <h4 style={{ color: colors.lightPurple, marginBottom: '1rem', fontSize: '1.2rem', borderBottom: `2px solid ${colors.purple}`, paddingBottom: '0.5rem' }}>🌍 Demographics</h4>
              <p><strong>Age:</strong> {onboarding.date_of_birth ? `${calculateAge(onboarding.date_of_birth)} years` : "N/A"}</p>
              <p><strong>Date of Birth:</strong> {onboarding.date_of_birth ? new Date(onboarding.date_of_birth).toLocaleDateString() : "N/A"}</p>
              <p><strong>Gender:</strong> {onboarding.gender || "N/A"}</p>
              <p><strong>Location:</strong> {onboarding.location || "N/A"}</p>
              <p><strong>Blood Group:</strong> {onboarding.blood_group || "N/A"}</p>
            </div>

            <div style={{ padding: '1.2rem', background: 'rgba(74, 0, 224, 0.15)', borderRadius: '12px', border: `1px solid ${colors.darkOrchid}` }}>
              <h4 style={{ color: colors.lightPurple, marginBottom: '1rem', fontSize: '1.2rem', borderBottom: `2px solid ${colors.purple}`, paddingBottom: '0.5rem' }}>⚖️ Physical Metrics</h4>
              <p><strong>Weight:</strong> {onboarding.weight_kg ? `${onboarding.weight_kg} kg` : "N/A"}</p>
              <p><strong>Height:</strong> {onboarding.height_cm ? `${onboarding.height_cm} cm` : "N/A"}</p>
              <p>
                <strong>BMI:</strong> {bmi ? (
                  <span style={{ color: getBMIColor(bmi), fontWeight: 'bold' }}>
                    {bmi} ({category})
                  </span>
                ) : "N/A"}
              </p>
            </div>

            <div style={{ padding: '1.2rem', background: 'rgba(74, 0, 224, 0.15)', borderRadius: '12px', border: `1px solid ${colors.darkOrchid}` }}>
              <h4 style={{ color: colors.lightPurple, marginBottom: '1rem', fontSize: '1.2rem', borderBottom: `2px solid ${colors.purple}`, paddingBottom: '0.5rem' }}>⚠️ Risk Factors</h4>
              <p><strong>Smoker:</strong> {onboarding.smoker !== undefined ? (onboarding.smoker ? "✅ Yes" : "❌ No") : "N/A"}</p>
              <p><strong>Alcohol Drinker:</strong> {onboarding.alcohol_drinker !== undefined ? (onboarding.alcohol_drinker ? "✅ Yes" : "❌ No") : "N/A"}</p>
            </div>

            <div style={{ padding: '1.2rem', background: 'rgba(74, 0, 224, 0.15)', borderRadius: '12px', border: `1px solid ${colors.darkOrchid}` }}>
              <h4 style={{ color: colors.lightPurple, marginBottom: '1rem', fontSize: '1.2rem', borderBottom: `2px solid ${colors.purple}`, paddingBottom: '0.5rem' }}>🏥 Medical Background</h4>
              <p><strong>Chronic Condition:</strong> {onboarding.long_term_condition || "None reported"}</p>
              <p><strong>Long-term Medications:</strong> {onboarding.long_term_medication || "None reported"}</p>
              <p><strong>Family History:</strong> {onboarding.family_history || "None reported"}</p>
            </div>
          </div>
        </div>
      )}

      {threeDayCheckin && (
        <div style={{ 
          marginBottom: '2rem', 
          padding: '1.8rem', 
          border: `2px solid ${colors.blue}`, 
          borderRadius: '18px', 
          background: `linear-gradient(145deg, ${colors.darkBlue2} 0%, ${colors.darkerBlue} 100%)`, 
          boxShadow: '0 6px 20px rgba(65, 105, 225, 0.25)' 
        }}>
          <h3 style={{ color: colors.lightBlue, marginBottom: '1.2rem', fontSize: '1.5rem' }}>📊 Latest 3-Day Check-in</h3>
          <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap' }}>
            <p><strong>😴 Sleep:</strong> {threeDayCheckin.sleep_hours_numeric || "N/A"} hours/night</p>
            <p><strong>😊 Mood:</strong> {threeDayCheckin.mood_numeric ? `${threeDayCheckin.mood_numeric}/10` : "N/A"}</p>
            <p><strong>😰 Stress Level:</strong> {threeDayCheckin.what_stresses_you_numeric ? `${threeDayCheckin.what_stresses_you_numeric}/10` : "N/A"}</p>
            <p><strong>💪 Exercise:</strong> {threeDayCheckin.exercise_level_numeric ? `${threeDayCheckin.exercise_level_numeric}/10 intensity` : "N/A"}</p>
            <p><strong>⚡ Energy:</strong> {threeDayCheckin.energy_level_numeric ? `${threeDayCheckin.energy_level_numeric}/10` : "N/A"}</p>
            <p><strong>🍽️ Meals:</strong> {threeDayCheckin.meals_today_numeric || "N/A"} today</p>
          </div>
          <p style={{ marginTop: '1rem', color: '#A9A9A9', fontSize: '0.9rem' }}>
            <small>Last updated: {new Date(threeDayCheckin.created_at).toLocaleDateString()}</small>
          </p>
        </div>
      )}

      {mentalAssessment && (
        <div style={{ 
          marginBottom: '2rem', 
          padding: '1.8rem', 
          border: `2px solid ${colors.darkOrchid}`, 
          borderRadius: '18px', 
          background: `linear-gradient(145deg, ${colors.indigo} 0%, ${colors.darkSlateBlue} 100%)`, 
          boxShadow: '0 6px 20px rgba(153, 50, 204, 0.25)' 
        }}>
          <h3 style={{ color: colors.plum, marginBottom: '1.2rem', fontSize: '1.5rem' }}>🧠 Mental Health Assessment</h3>
          <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap' }}>
            <p><strong>😊 Mood Today:</strong> {mentalAssessment.feeling_today || "N/A"}</p>
            <p><strong>🌪️ Stress/Anxiety:</strong> {mentalAssessment.stress_anxiety_overwhelm || "N/A"}</p>
          </div>
          <p style={{ marginTop: '1rem', color: colors.thistle, fontSize: '0.9rem' }}>
            <small>Last assessment: {new Date(mentalAssessment.created_at).toLocaleDateString()}</small>
          </p>
        </div>
      )}

      {medications.length > 0 && (
        <div style={{ 
          marginBottom: '2rem', 
          padding: '1.8rem', 
          border: `2px solid ${colors.steelBlue}`, 
          borderRadius: '18px', 
          background: `linear-gradient(145deg, ${colors.darkSlate} 0%, ${colors.slate} 100%)`, 
          boxShadow: '0 6px 20px rgba(70, 130, 180, 0.25)' 
        }}>
          <h3 style={{ color: colors.cadetBlue, marginBottom: '1.2rem', fontSize: '1.5rem' }}>💊 Current Medications</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {medications.map(med => (
              <li key={med.id} style={{ padding: '0.8rem 0', borderBottom: `1px solid ${colors.slateGray}`, display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <span style={{ fontSize: '1.2rem' }}>💊</span>
                <div>
                  <strong style={{ color: colors.lightCyan }}>{med.medication_name || "Unknown Medication"}</strong>
                  {med.dosage && <span style={{ color: colors.lightSteel, marginLeft: '0.5rem' }}>({med.dosage})</span>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!onboarding && !threeDayCheckin && !mentalAssessment && medications.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
          <p>No patient data found for this user.</p>
        </div>
      )}
    </div>
  );
}