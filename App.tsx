/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useTransition } from 'react';
import {
  User,
  Course,
  LearningMaterial,
  Assessment,
  Enrollment,
  AssessmentResult,
  Certificate,
  Announcement,
} from './types';
import { storage } from './services/storage';
import { authService } from './services/auth';
import { toast } from './services/toast';

// Layout Components
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ToastContainer } from './components/common/ToastContainer';
import { AnnouncementsModal } from './components/common/AnnouncementsModal';

// Auth Pages (Login-First Experience)
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Modals
import { AssessmentModal } from './components/trainee/AssessmentModal';
import { CertificateModal } from './components/trainee/CertificateModal';
import { CreateCourseModal } from './components/trainer/CreateCourseModal';
import { AddMaterialModal } from './components/trainer/AddMaterialModal';
import { CreateAssessmentModal } from './components/trainer/CreateAssessmentModal';
import { ViewSubmissionModal } from './components/trainer/ViewSubmissionModal';
import { CreateAnnouncementModal } from './components/admin/CreateAnnouncementModal';
import { UserEditModal } from './components/admin/UserEditModal';

// Shared Pages
import { CoursesPage } from './pages/public/CoursesPage';
import { CourseDetailPage } from './pages/public/CourseDetailPage';

// Trainee Pages
import { TraineeDashboard } from './pages/trainee/TraineeDashboard';
import { TraineeMyCourses } from './pages/trainee/TraineeMyCourses';
import { TraineeMaterials } from './pages/trainee/TraineeMaterials';
import { TraineeAssessments } from './pages/trainee/TraineeAssessments';
import { TraineeProgress } from './pages/trainee/TraineeProgress';
import { TraineeCertificates } from './pages/trainee/TraineeCertificates';
import { TraineeAIRecommendations } from './pages/trainee/TraineeAIRecommendations';
import { TraineeProfile } from './pages/trainee/TraineeProfile';

// Trainer Pages
import { TrainerDashboard } from './pages/trainer/TrainerDashboard';
import { TrainerCourses } from './pages/trainer/TrainerCourses';
import { TrainerMaterials } from './pages/trainer/TrainerMaterials';
import { TrainerAssessments } from './pages/trainer/TrainerAssessments';
import { TrainerPerformance } from './pages/trainer/TrainerPerformance';
import { TrainerProfile } from './pages/trainer/TrainerProfile';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminCourses } from './pages/admin/AdminCourses';
import { AdminEnrollments } from './pages/admin/AdminEnrollments';
import { AdminAssessments } from './pages/admin/AdminAssessments';
import { AdminCertifications } from './pages/admin/AdminCertifications';
import { AdminParticipation } from './pages/admin/AdminParticipation';
import { AdminCompetency } from './pages/admin/AdminCompetency';
import { AdminAnnouncements } from './pages/admin/AdminAnnouncements';
import { AdminReports } from './pages/admin/AdminReports';
import { AdminSettings } from './pages/admin/AdminSettings';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => authService.getCurrentUser());
  const [currentRoute, setCurrentRoute] = useState<string>(() =>
    currentUser ? `${currentUser.role}-dashboard` : 'login'
  );

  // Reactive Database State
  const [users, setUsers] = useState<User[]>(() => storage.getUsers());
  const [courses, setCourses] = useState<Course[]>(() => storage.getCourses());
  const [materials, setMaterials] = useState<LearningMaterial[]>(() => storage.getMaterials());
  const [assessments, setAssessments] = useState<Assessment[]>(() => storage.getAssessments());
  const [enrollments, setEnrollments] = useState<Enrollment[]>(() => storage.getEnrollments());
  const [results, setResults] = useState<AssessmentResult[]>(() => storage.getResults());
  const [certificates, setCertificates] = useState<Certificate[]>(() => storage.getCertificates());
  const [announcements, setAnnouncements] = useState<Announcement[]>(() =>
    storage.getAnnouncements()
  );

  // Active Selected Course for Detail view
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  // Modals state
  const [announcementsModalOpen, setAnnouncementsModalOpen] = useState(false);
  const [activeAssessment, setActiveAssessment] = useState<Assessment | null>(null);
  const [activeCertificate, setActiveCertificate] = useState<Certificate | null>(null);

  const [createCourseModalOpen, setCreateCourseModalOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState<Course | null>(null);

  const [addMaterialModalOpen, setAddMaterialModalOpen] = useState(false);
  const [addMaterialDefaultCourseId, setAddMaterialDefaultCourseId] = useState<string | undefined>();

  const [createAssessmentModalOpen, setCreateAssessmentModalOpen] = useState(false);
  const [createAssessmentDefaultCourseId, setCreateAssessmentDefaultCourseId] = useState<
    string | undefined
  >();

  const [viewSubmissionModalOpen, setViewSubmissionModalOpen] = useState(false);
  const [activeSubmissionResult, setActiveSubmissionResult] = useState<AssessmentResult | null>(null);

  const [createAnnouncementModalOpen, setCreateAnnouncementModalOpen] = useState(false);
  const [userEditModalOpen, setUserEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  // Storage listener for data reactivity
  useEffect(() => {
    return storage.subscribe(() => {
      setUsers(storage.getUsers());
      setCourses(storage.getCourses());
      setMaterials(storage.getMaterials());
      setAssessments(storage.getAssessments());
      setEnrollments(storage.getEnrollments());
      setResults(storage.getResults());
      setCertificates(storage.getCertificates());
      setAnnouncements(storage.getAnnouncements());
    });
  }, []);

  // Auth session listener
  useEffect(() => {
    return authService.subscribe((user) => {
      setCurrentUser(user);
      if (user) {
        setCurrentRoute(`${user.role}-dashboard`);
      } else {
        setCurrentRoute('login');
      }
    });
  }, []);

  // STRICT ROUTE PROTECTION ENFORCEMENT
  const handleNavigate = (route: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // If unauthenticated, only login and register are accessible
    if (!currentUser) {
      if (route === 'register') {
        setCurrentRoute('register');
      } else {
        setCurrentRoute('login');
      }
      return;
    }

    const role = currentUser.role;

    // Common shared routes allowed for authenticated users
    const commonRoutes = ['courses', 'course-detail'];

    // Role-specific allowed route tables
    const traineeAllowed = [
      'trainee-dashboard',
      'trainee-my-courses',
      'trainee-materials',
      'trainee-assessments',
      'trainee-progress',
      'trainee-certificates',
      'trainee-ai',
      'trainee-profile',
      ...commonRoutes,
    ];

    const trainerAllowed = [
      'trainer-dashboard',
      'trainer-courses',
      'trainer-materials',
      'trainer-assessments',
      'trainer-performance',
      'trainer-profile',
      ...commonRoutes,
    ];

    const adminAllowed = [
      'admin-dashboard',
      'admin-users',
      'admin-courses',
      'admin-enrollments',
      'admin-assessments',
      'admin-certifications',
      'admin-participation',
      'admin-competency',
      'admin-announcements',
      'admin-reports',
      'admin-settings',
      'admin-profile',
      ...commonRoutes,
    ];

    let isAuthorized = false;
    if (role === 'trainee') isAuthorized = traineeAllowed.includes(route);
    else if (role === 'trainer') isAuthorized = trainerAllowed.includes(route);
    else if (role === 'admin') isAuthorized = adminAllowed.includes(route);

    if (isAuthorized) {
      setCurrentRoute(route);
    } else {
      toast.warning(
        'Access Restricted',
        `Your ${role.toUpperCase()} account is not authorized to access that section. Redirecting to your dashboard.`
      );
      setCurrentRoute(`${role}-dashboard`);
    }
  };

  const handleSelectCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    handleNavigate('course-detail');
  };

  const handleLogout = () => {
    authService.logout();
    toast.info('Signed Out', 'You have been logged out of Capacity Connect.');
    setCurrentRoute('login');
  };

  const handleOpenAddMaterialForCourse = (courseId: string) => {
    setAddMaterialDefaultCourseId(courseId);
    setAddMaterialModalOpen(true);
  };

  const handleOpenAddAssessmentForCourse = (courseId: string) => {
    setCreateAssessmentDefaultCourseId(courseId);
    setCreateAssessmentModalOpen(true);
  };

  const handleEditCourse = (course: Course) => {
    setCourseToEdit(course);
    setCreateCourseModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setUserToEdit(user);
    setUserEditModalOpen(true);
  };

  const handleViewSubmission = (res: AssessmentResult) => {
    setActiveSubmissionResult(res);
    setViewSubmissionModalOpen(true);
  };

  // If NOT authenticated, enforce the Login-First experience
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-900 font-sans selection:bg-indigo-500 selection:text-white">
        <ToastContainer />
        {currentRoute === 'register' ? (
          <RegisterPage
            onRegisterSuccess={(needsApproval) => {
              if (needsApproval) {
                setCurrentRoute('login');
              } else {
                const user = authService.getCurrentUser();
                if (user) {
                  setCurrentRoute(`${user.role}-dashboard`);
                } else {
                  setCurrentRoute('login');
                }
              }
            }}
            onNavigateToLogin={() => setCurrentRoute('login')}
          />
        ) : (
          <LoginPage
            onLoginSuccess={() => {
              const user = authService.getCurrentUser();
              if (user) {
                setCurrentRoute(`${user.role}-dashboard`);
              }
            }}
            onNavigateToRegister={() => setCurrentRoute('register')}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Toast Alert System */}
      <ToastContainer />

      {/* Role-Specific Navigation Header */}
      <Navbar
        currentUser={currentUser}
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
        announcements={announcements}
        onOpenAnnouncements={() => setAnnouncementsModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Authenticated Router */}
      <main className="flex-1">
        {/* SHARED COURSE CATALOG & DETAIL */}
        {currentRoute === 'courses' && (
          <CoursesPage
            courses={courses}
            enrollments={enrollments}
            currentUser={currentUser}
            onSelectCourse={handleSelectCourse}
            onOpenAuth={() => handleLogout()}
          />
        )}

        {currentRoute === 'course-detail' && selectedCourseId && (
          <CourseDetailPage
            courseId={selectedCourseId}
            courses={courses}
            materials={materials}
            assessments={assessments}
            enrollments={enrollments}
            currentUser={currentUser}
            onBack={() => handleNavigate('courses')}
            onOpenAssessment={(asm) => setActiveAssessment(asm)}
            onOpenAddMaterial={handleOpenAddMaterialForCourse}
            onOpenAddAssessment={handleOpenAddAssessmentForCourse}
            onOpenAuth={() => handleLogout()}
          />
        )}

        {/* TRAINEE WORKSPACE */}
        {currentUser.role === 'trainee' && (
          <>
            {currentRoute === 'trainee-dashboard' && (
              <TraineeDashboard
                currentUser={currentUser}
                courses={courses}
                enrollments={enrollments}
                assessments={assessments}
                results={results}
                certificates={certificates}
                announcements={announcements}
                onNavigate={handleNavigate}
                onSelectCourse={handleSelectCourse}
                onTakeAssessment={(asm) => setActiveAssessment(asm)}
                onViewCertificate={(cert) => setActiveCertificate(cert)}
              />
            )}

            {currentRoute === 'trainee-my-courses' && (
              <TraineeMyCourses
                currentUser={currentUser}
                courses={courses}
                enrollments={enrollments}
                onSelectCourse={handleSelectCourse}
                onNavigate={handleNavigate}
              />
            )}

            {currentRoute === 'trainee-materials' && (
              <TraineeMaterials
                currentUser={currentUser}
                courses={courses}
                enrollments={enrollments}
                materials={materials}
                onSelectCourse={handleSelectCourse}
              />
            )}

            {currentRoute === 'trainee-assessments' && (
              <TraineeAssessments
                currentUser={currentUser}
                assessments={assessments}
                results={results}
                courses={courses}
                onTakeAssessment={(asm) => setActiveAssessment(asm)}
                onNavigate={handleNavigate}
              />
            )}

            {currentRoute === 'trainee-progress' && (
              <TraineeProgress
                currentUser={currentUser}
                courses={courses}
                enrollments={enrollments}
                results={results}
                certificates={certificates}
                onNavigate={handleNavigate}
                onSelectCourse={handleSelectCourse}
              />
            )}

            {currentRoute === 'trainee-certificates' && (
              <TraineeCertificates
                currentUser={currentUser}
                certificates={certificates}
                onViewCertificate={(cert) => setActiveCertificate(cert)}
                onNavigate={handleNavigate}
              />
            )}

            {currentRoute === 'trainee-ai' && (
              <TraineeAIRecommendations
                currentUser={currentUser}
                courses={courses}
                enrollments={enrollments}
                onSelectCourse={handleSelectCourse}
                onNavigate={handleNavigate}
              />
            )}

            {currentRoute === 'trainee-profile' && (
              <TraineeProfile currentUser={currentUser} />
            )}
          </>
        )}

        {/* TRAINER WORKSPACE */}
        {currentUser.role === 'trainer' && (
          <>
            {currentRoute === 'trainer-dashboard' && (
              <TrainerDashboard
                currentUser={currentUser}
                courses={courses}
                materials={materials}
                assessments={assessments}
                enrollments={enrollments}
                results={results}
                onNavigate={handleNavigate}
                onOpenCreateCourse={() => {
                  setCourseToEdit(null);
                  setCreateCourseModalOpen(true);
                }}
                onOpenAddMaterial={() => {
                  setAddMaterialDefaultCourseId(undefined);
                  setAddMaterialModalOpen(true);
                }}
                onOpenCreateAssessment={() => {
                  setCreateAssessmentDefaultCourseId(undefined);
                  setCreateAssessmentModalOpen(true);
                }}
                onSelectCourse={handleSelectCourse}
              />
            )}

            {currentRoute === 'trainer-courses' && (
              <TrainerCourses
                currentUser={currentUser}
                courses={courses}
                enrollments={enrollments}
                onOpenCreateCourse={() => {
                  setCourseToEdit(null);
                  setCreateCourseModalOpen(true);
                }}
                onEditCourse={handleEditCourse}
                onSelectCourse={handleSelectCourse}
              />
            )}

            {currentRoute === 'trainer-materials' && (
              <TrainerMaterials
                currentUser={currentUser}
                courses={courses}
                materials={materials}
                onOpenAddMaterial={() => {
                  setAddMaterialDefaultCourseId(undefined);
                  setAddMaterialModalOpen(true);
                }}
                onSelectCourse={handleSelectCourse}
              />
            )}

            {currentRoute === 'trainer-assessments' && (
              <TrainerAssessments
                currentUser={currentUser}
                courses={courses}
                assessments={assessments}
                results={results}
                onOpenCreateAssessment={() => {
                  setCreateAssessmentDefaultCourseId(undefined);
                  setCreateAssessmentModalOpen(true);
                }}
                onNavigate={handleNavigate}
              />
            )}

            {currentRoute === 'trainer-performance' && (
              <TrainerPerformance
                currentUser={currentUser}
                courses={courses}
                assessments={assessments}
                results={results}
                onViewSubmission={handleViewSubmission}
              />
            )}

            {currentRoute === 'trainer-profile' && (
              <TrainerProfile currentUser={currentUser} />
            )}
          </>
        )}

        {/* ADMIN WORKSPACE */}
        {currentUser.role === 'admin' && (
          <>
            {currentRoute === 'admin-dashboard' && (
              <AdminDashboard
                currentUser={currentUser}
                users={users}
                courses={courses}
                enrollments={enrollments}
                assessments={assessments}
                results={results}
                certificates={certificates}
                announcements={announcements}
                onNavigate={handleNavigate}
                onOpenAnnouncementModal={() => setCreateAnnouncementModalOpen(true)}
              />
            )}

            {currentRoute === 'admin-users' && (
              <AdminUsers
                users={users}
                currentUser={currentUser}
                onEditUser={handleEditUser}
              />
            )}

            {currentRoute === 'admin-courses' && (
              <AdminCourses
                courses={courses}
                enrollments={enrollments}
                assessments={assessments}
                onSelectCourse={handleSelectCourse}
              />
            )}

            {currentRoute === 'admin-enrollments' && (
              <AdminEnrollments
                enrollments={enrollments}
                courses={courses}
                users={users}
                onSelectCourse={handleSelectCourse}
              />
            )}

            {currentRoute === 'admin-assessments' && (
              <AdminAssessments
                assessments={assessments}
                results={results}
                courses={courses}
                onViewSubmission={handleViewSubmission}
              />
            )}

            {currentRoute === 'admin-certifications' && (
              <AdminCertifications
                certificates={certificates}
                onViewCertificate={(cert) => setActiveCertificate(cert)}
              />
            )}

            {currentRoute === 'admin-participation' && (
              <AdminParticipation
                users={users}
                courses={courses}
                enrollments={enrollments}
                results={results}
              />
            )}

            {currentRoute === 'admin-competency' && (
              <AdminCompetency
                users={users}
                courses={courses}
                results={results}
              />
            )}

            {currentRoute === 'admin-announcements' && (
              <AdminAnnouncements
                announcements={announcements}
                onOpenCreateModal={() => setCreateAnnouncementModalOpen(true)}
              />
            )}

            {currentRoute === 'admin-reports' && (
              <AdminReports
                users={users}
                courses={courses}
                enrollments={enrollments}
                results={results}
                certificates={certificates}
              />
            )}

            {currentRoute === 'admin-settings' && <AdminSettings />}

            {currentRoute === 'admin-profile' && (
              <TraineeProfile currentUser={currentUser} />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} onOpenAuth={() => handleLogout()} />

      {/* ALL FUNCTIONAL MODALS PRESERVED */}
      {/* 1. Announcements Bulletin Modal */}
      <AnnouncementsModal
        isOpen={announcementsModalOpen}
        onClose={() => setAnnouncementsModalOpen(false)}
        announcements={announcements}
      />

      {/* 2. Trainee Interactive Assessment Exam Modal */}
      {activeAssessment && currentUser && (
        <AssessmentModal
          isOpen={!!activeAssessment}
          onClose={() => setActiveAssessment(null)}
          assessment={activeAssessment}
          currentUser={currentUser}
          onCompleted={() => {
            // storage listener automatically handles updates
          }}
        />
      )}

      {/* 3. Trainee Certificate Modal */}
      <CertificateModal
        isOpen={!!activeCertificate}
        onClose={() => setActiveCertificate(null)}
        certificate={activeCertificate}
      />

      {/* 4. Trainer Create/Edit Course Modal */}
      {currentUser && (
        <CreateCourseModal
          isOpen={createCourseModalOpen}
          onClose={() => {
            setCreateCourseModalOpen(false);
            setCourseToEdit(null);
          }}
          currentUser={currentUser}
          courseToEdit={courseToEdit}
        />
      )}

      {/* 5. Trainer Add Material Modal */}
      {currentUser && (
        <AddMaterialModal
          isOpen={addMaterialModalOpen}
          onClose={() => setAddMaterialModalOpen(false)}
          currentUser={currentUser}
          courses={courses}
          defaultCourseId={addMaterialDefaultCourseId}
        />
      )}

      {/* 6. Trainer Create Assessment Modal */}
      {currentUser && (
        <CreateAssessmentModal
          isOpen={createAssessmentModalOpen}
          onClose={() => setCreateAssessmentModalOpen(false)}
          currentUser={currentUser}
          courses={courses}
          defaultCourseId={createAssessmentDefaultCourseId}
        />
      )}

      {/* 7. View Submission Breakdown Modal */}
      <ViewSubmissionModal
        isOpen={viewSubmissionModalOpen}
        onClose={() => {
          setViewSubmissionModalOpen(false);
          setActiveSubmissionResult(null);
        }}
        result={activeSubmissionResult}
        assessment={assessments.find((a) => a.id === activeSubmissionResult?.assessmentId)}
      />

      {/* 8. Admin Create Announcement Modal */}
      {currentUser && (
        <CreateAnnouncementModal
          isOpen={createAnnouncementModalOpen}
          onClose={() => setCreateAnnouncementModalOpen(false)}
          currentUser={currentUser}
        />
      )}

      {/* 9. Admin User Edit Modal */}
      <UserEditModal
        isOpen={userEditModalOpen}
        onClose={() => {
          setUserEditModalOpen(false);
          setUserToEdit(null);
        }}
        user={userToEdit}
      />
    </div>
  );
}
