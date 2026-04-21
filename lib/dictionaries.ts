export type Language = 'id' | 'en';

export const dictionaries = {
  id: {
    navbar: {
      dashboard: 'Dashboard',
      workout: 'Workout',
      log: 'Log',
      nutrition: 'Nutrisi',
      history: 'Riwayat',
      profile: 'Profil',
    },
    theme: { toggle: 'Toggle tema' },
    common: {
      loading: 'Memuat...',
      cancel: 'Batal',
      save: 'Simpan',
      add: 'Tambah',
      done: 'Selesai',
      all: 'Semua',
      target: 'Target',
      today: 'Hari Ini'
    },
    dashboard: { /* ... see previous ... */ },
    workout: { /* ... see previous ... */ },
    nutrition: {
      title: 'Nutrisi',
      target: 'Tracking kalori & makronutrien harian',
      cal: 'Kalori',
      pro: 'Protein',
      carbs: 'Karbo',
      fat: 'Lemak',
      todayTarget: 'Ringkasan Hari Ini',
      calorieLeft: 'Sisa Kalori',
      proteinLeft: 'Sisa Protein',
      calc: '🔢 Kalkulator',
      photo: '📷 Foto Makanan',
      aiSearch: '✨ Cari via AI',
      manage: '⚙️ Kelola',
      addMeal: '+ Catat Makan',
      date: 'Tanggal:',
      historyTitle: 'Riwayat Makan Hari Ini',
      emptyMenu: 'Belum ada makanan hari ini',
      emptyLogTitle: 'Belum ada catatan makan',
      emptyLogSub: 'Catat makanan untuk tracking nutrisi',
      modal: {
        title: 'Tambah Makanan',
        food: 'Pilih Makanan',
        qty: 'Jumlah'
      }
    },
    history: {
      title: 'Statistik & Riwayat',
      subtitle: 'Progress latihan dan nutrisi kamu',
      empty: 'Belum ada riwayat latihan',
      stats: {
        totalSessions: 'Total Sesi',
        totalVolume: 'Total Volume',
        totalExercise: 'Total Latihan',
        avgDuration: 'Rata-rata Dur',
        sessionsUnit: 'sesi',
        tonUnit: 'ton',
        exerciseUnit: 'exercise',
        minuteUnit: 'menit'
      },
      filters: {
        sevenDays: '7 Hari',
        thirtyDays: '30 Hari'
      },
      charts: {
        volChart: 'Volume Latihan',
        calChart: 'Kalori Harian',
        proChart: 'Protein Harian',
        distChart: 'Distribusi Otot (Total Set)',
        typeChart: 'Tipe Workout',
        emptyData: 'Belum ada data'
      }
    },
    profile: {
      title: 'Profil',
      subtitle: 'Pengaturan dan target personal kamu',
      personalData: 'Data Diri',
      name: 'Nama',
      weight: 'Berat Badan (kg)',
      height: 'Tinggi Badan (cm)',
      goal: 'Goal',
      gymDays: 'Hari Gym per Minggu',
      nutritionTargets: 'Target Nutrisi',
      targetCal: 'Target Kalori (kkal/hari)',
      targetPro: 'Target Protein (g/hari)',
      recBB: 'Rekomendasi BB',
      recText: 'Rekomendasi',
      saveChanges: 'Simpan Perubahan',
      saved: '✓ Tersimpan!',
      bodyStats: 'Statistik Tubuh',
      bmi: 'BMI',
      idealWeight: 'Berat Ideal',
      appearance: 'Tampilan',
      themeSwitch: 'Ganti tema tampilan'
    },
    logWorkout: {
      title: 'Log Workout',
      subtitle: 'Semua sesi latihan kamu',
      newWorkout: '+ Workout Baru',
      filterAll: 'Semua',
      exerciseLabel: 'latihan',
      minuteLabel: 'menit',
      tonLabel: 'ton',
      emptyTitle: 'Belum ada log workout',
      emptySub: 'Mulai workout pertama kamu!',
      startFirst: 'Mulai Workout',
      deleteSession: '🗑️ Hapus Sesi',
      deleteConfirm: 'Hapus sesi ini?'
    }
  },
  en: {
    navbar: {
      dashboard: 'Dashboard',
      workout: 'Workout',
      log: 'Log',
      nutrition: 'Nutrition',
      history: 'History',
      profile: 'Profile',
    },
    theme: { toggle: 'Toggle theme' },
    common: {
      loading: 'Loading...',
      cancel: 'Cancel',
      save: 'Save',
      add: 'Add',
      done: 'Done',
      all: 'All',
      target: 'Target',
      today: 'Today'
    },
    dashboard: { /* ... see previous ... */ },
    workout: { /* ... see previous ... */ },
    nutrition: {
      title: 'Nutrition',
      target: 'Daily calories & macros tracking',
      cal: 'Calories',
      pro: 'Protein',
      carbs: 'Carbs',
      fat: 'Fat',
      todayTarget: 'Today',
      calorieLeft: 'Calories left',
      proteinLeft: 'Protein left',
      calc: '🔢 Calculator',
      photo: '📷 Food Photo',
      aiSearch: '✨ AI Search',
      manage: '⚙️ Manage',
      addMeal: '+ Log Meal',
      date: 'Date:',
      historyTitle: 'Today\'s Meal History',
      emptyMenu: 'No meals logged today',
      emptyLogTitle: 'No meals logged',
      emptyLogSub: 'Log food to track your nutrition',
      modal: {
        title: 'Add Food',
        food: 'Select Food',
        qty: 'Quantity'
      }
    },
    history: {
      title: 'Stats & History',
      subtitle: 'Your workout and nutrition progress',
      empty: 'No workout history yet',
      stats: {
        totalSessions: 'Total Sessions',
        totalVolume: 'Total Volume',
        totalExercise: 'Total Exercises',
        avgDuration: 'Avg Duration',
        sessionsUnit: 'sessions',
        tonUnit: 'tons',
        exerciseUnit: 'exercises',
        minuteUnit: 'minutes'
      },
      filters: {
        sevenDays: '7 Days',
        thirtyDays: '30 Days'
      },
      charts: {
        volChart: 'Workout Volume',
        calChart: 'Daily Calories',
        proChart: 'Daily Protein',
        distChart: 'Muscle Distribution (Total Sets)',
        typeChart: 'Workout Type',
        emptyData: 'No data yet'
      }
    },
    profile: {
      title: 'Profile',
      subtitle: 'Your personal settings and targets',
      personalData: 'Personal Data',
      name: 'Name',
      weight: 'Body Weight (kg)',
      height: 'Height (cm)',
      goal: 'Goal',
      gymDays: 'Gym Days per Week',
      nutritionTargets: 'Nutrition Targets',
      targetCal: 'Target Calories (kcal/day)',
      targetPro: 'Target Protein (g/day)',
      recBB: 'Rec. BW',
      recText: 'Recommended',
      saveChanges: 'Save Changes',
      saved: '✓ Saved!',
      bodyStats: 'Body Stats',
      bmi: 'BMI',
      idealWeight: 'Ideal Weight',
      appearance: 'Appearance',
      themeSwitch: 'Change app theme'
    },
    logWorkout: {
      title: 'Workout Log',
      subtitle: 'All your workout sessions',
      newWorkout: '+ New Workout',
      filterAll: 'All',
      exerciseLabel: 'exercises',
      minuteLabel: 'minutes',
      tonLabel: 'tons',
      emptyTitle: 'No workout log yet',
      emptySub: 'Start your first workout!',
      startFirst: 'Start Workout',
      deleteSession: '🗑️ Delete Session',
      deleteConfirm: 'Delete this session?'
    }
  }
};
