// User & Auth
export enum UserRole {
  ADMIN = 'ADMIN',
  DOCTOR = 'DOCTOR',
  PATIENT = 'PATIENT',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string | null;
  phone?: string | null;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole.PATIENT | UserRole.DOCTOR;
  phone?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// Doctor
export enum DoctorAvailability {
  AVAILABLE = 'AVAILABLE',
  BUSY = 'BUSY',
  OFFLINE = 'OFFLINE',
}

export interface DoctorProfile {
  id: string;
  userId: string;
  specialty: string;
  subSpecialty?: string | null;
  licenseNumber: string;
  bio?: string | null;
  experienceYears: number;
  consultationFee: number;
  rating: number;
  reviewCount: number;
  availability: DoctorAvailability;
  languages: string[];
  education?: string | null;
  hospital?: string | null;
  user?: User;
}

export interface DoctorListQuery {
  page?: number;
  limit?: number;
  specialty?: string;
  search?: string;
  availability?: DoctorAvailability;
  minRating?: number;
}

// Patient
export interface PatientProfile {
  id: string;
  userId: string;
  dateOfBirth?: string | null;
  gender?: string | null;
  bloodGroup?: string | null;
  allergies?: string[];
  medicalHistory?: string | null;
  emergencyContact?: string | null;
  user?: User;
}

// Appointments
export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export enum ConsultationType {
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  CHAT = 'CHAT',
  IN_PERSON = 'IN_PERSON',
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  scheduledAt: string;
  durationMinutes: number;
  status: AppointmentStatus;
  consultationType: ConsultationType;
  reason?: string | null;
  notes?: string | null;
  meetingRoomId?: string | null;
  videoProvider?: VideoProvider | null;
  createdAt: string;
  updatedAt: string;
  patient?: PatientProfile;
  doctor?: DoctorProfile;
}

export interface CreateAppointmentRequest {
  doctorId: string;
  scheduledAt: string;
  durationMinutes?: number;
  consultationType: ConsultationType;
  reason?: string;
}

// Blog
export enum BlogStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl?: string | null;
  categoryId: string;
  authorId: string;
  status: BlogStatus;
  readTimeMinutes: number;
  viewCount: number;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  category?: BlogCategory;
  author?: User;
  tags?: string[];
}

export interface BlogListQuery {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  status?: BlogStatus;
}

// Chat & Messages
export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  FILE = 'FILE',
  SYSTEM = 'SYSTEM',
}

export interface Conversation {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId?: string | null;
  lastMessageAt?: string | null;
  createdAt: string;
  patient?: PatientProfile;
  doctor?: DoctorProfile;
  lastMessage?: Message;
  unreadCount?: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: MessageType;
  attachmentUrl?: string | null;
  readAt?: string | null;
  createdAt: string;
  sender?: User;
}

export interface SendMessageRequest {
  conversationId: string;
  content: string;
  type?: MessageType;
  attachmentUrl?: string;
}

// Notifications
export enum NotificationType {
  APPOINTMENT = 'APPOINTMENT',
  MESSAGE = 'MESSAGE',
  SYSTEM = 'SYSTEM',
  REVIEW = 'REVIEW',
  PRESCRIPTION = 'PRESCRIPTION',
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown> | null;
  readAt?: string | null;
  createdAt: string;
}

// Reviews
export interface Review {
  id: string;
  doctorId: string;
  patientId: string;
  appointmentId?: string | null;
  rating: number;
  comment?: string | null;
  createdAt: string;
  patient?: PatientProfile;
}

export interface CreateReviewRequest {
  doctorId: string;
  appointmentId?: string;
  rating: number;
  comment?: string;
}

// Prescriptions
export interface PrescriptionItem {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface Prescription {
  id: string;
  appointmentId: string;
  doctorId: string;
  patientId: string;
  diagnosis?: string | null;
  items: PrescriptionItem[];
  notes?: string | null;
  pdfUrl?: string | null;
  createdAt: string;
}

// Video Call
export enum VideoProvider {
  WEBRTC = 'WEBRTC',
  AGORA = 'AGORA',
  TWILIO = 'TWILIO',
  DAILY = 'DAILY',
}

export interface VideoCallToken {
  provider: VideoProvider;
  token: string;
  roomId: string;
  expiresAt: string;
  config?: Record<string, unknown>;
}

// AI Service
export interface SymptomCheckRequest {
  symptoms: string[];
  age?: number;
  gender?: string;
  duration?: string;
  severity?: string;
}

export interface SymptomCheckResponse {
  possibleConditions: Array<{
    name: string;
    probability: number;
    urgency: 'low' | 'medium' | 'high' | 'emergency';
    description: string;
  }>;
  recommendation: string;
  disclaimer: string;
}

export interface MedicalChatRequest {
  message: string;
  conversationId?: string;
  context?: Record<string, unknown>;
}

export interface MedicalChatResponse {
  reply: string;
  conversationId: string;
  suggestedActions?: string[];
}

export interface ReportSummarizeRequest {
  reportText: string;
  reportType?: string;
}

export interface ReportSummarizeResponse {
  summary: string;
  keyFindings: string[];
  recommendations: string[];
}

export interface DoctorRecommendationRequest {
  symptoms: string[];
  specialty?: string;
  location?: string;
}

export interface DoctorRecommendationResponse {
  doctors: Array<{
    doctorId: string;
    matchScore: number;
    reason: string;
  }>;
}

// API Response wrappers
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

// Socket events
export enum SocketEvent {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  JOIN_CONVERSATION = 'join_conversation',
  LEAVE_CONVERSATION = 'leave_conversation',
  SEND_MESSAGE = 'send_message',
  NEW_MESSAGE = 'new_message',
  TYPING_START = 'typing_start',
  TYPING_STOP = 'typing_stop',
  USER_ONLINE = 'user_online',
  USER_OFFLINE = 'user_offline',
  NOTIFICATION = 'notification',
  APPOINTMENT_UPDATE = 'appointment_update',
}

export interface TypingPayload {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

export interface OnlineStatusPayload {
  userId: string;
  isOnline: boolean;
  lastSeen?: string;
}

// Storage
export enum StorageProvider {
  CLOUDINARY = 'CLOUDINARY',
  S3 = 'S3',
}

export interface UploadResponse {
  url: string;
  publicId?: string;
  provider: StorageProvider;
}

// Ask Doctor (public Q&A)
export interface AskDoctorQuestion {
  id: string;
  category: string;
  question: string;
  answer?: string | null;
  answeredById?: string | null;
  isAnonymous: boolean;
  status: 'PENDING' | 'ANSWERED' | 'REJECTED';
  createdAt: string;
  answeredAt?: string | null;
  answeredBy?: User;
}

export interface SubmitQuestionRequest {
  category: string;
  question: string;
  name?: string;
  isAnonymous?: boolean;
}
