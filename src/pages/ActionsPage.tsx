import { useState } from "react";
import { QuickActions } from "@/components/QuickActions";
import { Zap, AlertTriangle, Route, GraduationCap, TreePine, Phone } from "lucide-react";
import { ReportViolationDialog, SafeRouteDialog, EcoLessonsDialog, TreePlantingDialog } from "@/components/quick-actions";
import { useLanguage } from "@/contexts/LanguageContext";

const ActionsPage = () => {
  const { t } = useLanguage();
  const [reportOpen, setReportOpen] = useState(false);
  const [routeOpen, setRouteOpen] = useState(false);
  const [educationOpen, setEducationOpen] = useState(false);
  const [plantOpen, setPlantOpen] = useState(false);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-display font-bold flex items-center gap-3">
          <Zap className="w-8 h-8 text-accent" />
          {t.actions.title}
        </h1>
        <p className="text-muted-foreground mt-1">{t.actions.contributeToCleanAir}</p>
      </div>

      {/* Quick Actions Grid */}
      <QuickActions />

      {/* Detailed Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Report Violation */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-destructive/20 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg">{t.actions.reportViolation}</h3>
              <p className="text-sm text-muted-foreground">{t.actions.helpIdentifySources}</p>
            </div>
          </div>
          <div className="space-y-3 mb-4">
            <p className="text-sm text-muted-foreground">{t.actions.violationTypes}:</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-muted rounded-full text-xs">{t.reportViolation.industrial}</span>
              <span className="px-3 py-1 bg-muted rounded-full text-xs">{t.reportViolation.smoking}</span>
              <span className="px-3 py-1 bg-muted rounded-full text-xs">{t.reportViolation.burning}</span>
              <span className="px-3 py-1 bg-muted rounded-full text-xs">{t.reportViolation.construction}</span>
            </div>
          </div>
          <button 
            onClick={() => setReportOpen(true)}
            className="w-full py-3 bg-destructive text-destructive-foreground rounded-xl font-medium hover:bg-destructive/90 transition-colors"
          >
            {t.actions.createReport} (+50 XP)
          </button>
        </div>

        {/* Safe Route */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
              <Route className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg">{t.actions.safeRoute}</h3>
              <p className="text-sm text-muted-foreground">{t.actions.findPathMinPollution}</p>
            </div>
          </div>
          <div className="space-y-3 mb-4">
            <p className="text-sm text-muted-foreground">
              {t.actions.algorithmConsiders}
            </p>
          </div>
          <button 
            onClick={() => setRouteOpen(true)}
            className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
          >
            {t.actions.buildRoute}
          </button>
        </div>

        {/* Eco Lessons */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg">{t.actions.ecoEducation}</h3>
              <p className="text-sm text-muted-foreground">{t.actions.learnMoreAboutAir}</p>
            </div>
          </div>
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm">{t.actions.whatIsPM25}</span>
              <span className="text-xs text-aqi-good">+20 XP</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm">{t.actions.pollutionSources}</span>
              <span className="text-xs text-aqi-good">+30 XP</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm">{t.actions.howToProtect}</span>
              <span className="text-xs text-aqi-good">+25 XP</span>
            </div>
          </div>
          <button 
            onClick={() => setEducationOpen(true)}
            className="w-full py-3 bg-secondary text-secondary-foreground rounded-xl font-medium hover:bg-secondary/90 transition-colors"
          >
            {t.actions.startLearning}
          </button>
        </div>

        {/* Plant a Tree */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-aqi-good/20 rounded-xl flex items-center justify-center">
              <TreePine className="w-6 h-6 text-aqi-good" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg">{t.actions.plantTree}</h3>
              <p className="text-sm text-muted-foreground">{t.actions.signUpForAction}</p>
            </div>
          </div>
          <div className="space-y-3 mb-4">
            <div className="p-3 bg-aqi-good/10 rounded-lg border border-aqi-good/30">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm">{t.actions.greenCityAction}</span>
                <span className="text-xs text-aqi-good">+100 XP</span>
              </div>
              <p className="text-xs text-muted-foreground">1 февраля, Центральный парк</p>
              <p className="text-xs text-muted-foreground">42 {t.actions.participantsSignedUp}</p>
            </div>
          </div>
          <button 
            onClick={() => setPlantOpen(true)}
            className="w-full py-3 bg-aqi-good text-white rounded-xl font-medium hover:bg-aqi-good/90 transition-colors"
          >
            {t.actions.signUpForEvent}
          </button>
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="font-display font-bold text-lg flex items-center gap-2 mb-4">
          <Phone className="w-5 h-5 text-destructive" />
          {t.actions.emergencyContacts}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-muted/50 rounded-xl">
            <p className="font-medium">{t.actions.ecologicalInspection}</p>
            <a href="tel:+77272619905" className="text-lg font-bold text-primary hover:underline">+7 727 261-99-05</a>
          </div>
          <div className="p-4 bg-muted/50 rounded-xl">
            <p className="font-medium">{t.actions.emergencyServices}</p>
            <a href="tel:112" className="text-lg font-bold text-destructive hover:underline">112</a>
          </div>
          <div className="p-4 bg-muted/50 rounded-xl">
            <p className="font-medium">{t.actions.mayorHotline}</p>
            <a href="tel:109" className="text-lg font-bold text-secondary hover:underline">109</a>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <ReportViolationDialog open={reportOpen} onOpenChange={setReportOpen} />
      <SafeRouteDialog open={routeOpen} onOpenChange={setRouteOpen} />
      <EcoLessonsDialog open={educationOpen} onOpenChange={setEducationOpen} />
      <TreePlantingDialog open={plantOpen} onOpenChange={setPlantOpen} />
    </div>
  );
};

export default ActionsPage;
