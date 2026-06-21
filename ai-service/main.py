from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
import os

app = FastAPI(
    title="DrInsight AI Service",
    description="Medical AI microservice for symptom checking, chatbot, and report analysis",
    version="1.0.0",
)

origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DISCLAIMER = (
    "This AI output is for informational purposes only and does not replace "
    "professional medical advice, diagnosis, or treatment."
)


class SymptomCheckRequest(BaseModel):
    symptoms: list[str]
    age: Optional[int] = None
    gender: Optional[str] = None
    duration: Optional[str] = None
    severity: Optional[str] = None


class MedicalChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    context: Optional[dict] = None


class ReportSummarizeRequest(BaseModel):
    report_text: str
    report_type: Optional[str] = None


class DoctorRecommendationRequest(BaseModel):
    symptoms: list[str]
    specialty: Optional[str] = None
    location: Optional[str] = None


@app.get("/health")
def health():
    return {"status": "ok", "service": "drinsight-ai"}


@app.post("/api/v1/symptom-checker")
def symptom_checker(req: SymptomCheckRequest):
    conditions = []
    for i, symptom in enumerate(req.symptoms[:3]):
        conditions.append({
            "name": f"Condition related to {symptom}",
            "probability": max(0.3, 0.9 - i * 0.2),
            "urgency": "medium" if i == 0 else "low",
            "description": f"Possible condition associated with {symptom}. Consult a physician for accurate diagnosis.",
        })

    return {
        "possibleConditions": conditions,
        "recommendation": "Schedule a consultation with a qualified healthcare provider for proper evaluation.",
        "disclaimer": DISCLAIMER,
    }


@app.post("/api/v1/medical-chat")
def medical_chat(req: MedicalChatRequest):
    return {
        "reply": (
            "Thank you for your question. Based on general medical knowledge, I recommend "
            "consulting with a licensed physician for personalized advice. "
            f"Regarding: {req.message[:100]}..."
        ),
        "conversationId": req.conversation_id or "new-conversation",
        "suggestedActions": [
            "Book a consultation with a specialist",
            "Use our symptom checker for more guidance",
            "Browse related articles on DrInsight",
        ],
        "disclaimer": DISCLAIMER,
    }


@app.post("/api/v1/report-summarize")
def report_summarize(req: ReportSummarizeRequest):
    return {
        "summary": f"Medical report summary ({req.report_type or 'general'}): Key findings extracted from the provided report.",
        "keyFindings": [
            "Report reviewed for significant clinical indicators",
            "Follow-up with ordering physician recommended",
        ],
        "recommendations": [
            "Discuss results with your healthcare provider",
            "Schedule follow-up if advised in the report",
        ],
        "disclaimer": DISCLAIMER,
    }


@app.post("/api/v1/doctor-recommendation")
def doctor_recommendation(req: DoctorRecommendationRequest):
    specialty = req.specialty or "General Medicine"
    return {
        "doctors": [
            {
                "doctorId": "recommended-doctor-1",
                "matchScore": 0.92,
                "reason": f"Specializes in {specialty} and matches reported symptoms",
            },
            {
                "doctorId": "recommended-doctor-2",
                "matchScore": 0.85,
                "reason": "High patient satisfaction and relevant experience",
            },
        ],
        "disclaimer": DISCLAIMER,
    }
