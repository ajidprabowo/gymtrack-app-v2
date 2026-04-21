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
    dashboard: {
      loading: 'Memuat...',
      morning: 'Selamat Pagi',
      afternoon: 'Selamat Siang',
      evening: 'Selamat Malam',
      sessionsThisWeek: 'sesi minggu ini',
      targetReached: '🎯 Target tercapai!',
      stats: {
        sessionThisWeek: 'Sesi Minggu Ini',
        volumeWeek: 'Volume Minggu',
        calToday: 'Kalori Hari Ini',
        proteinToday: 'Protein Hari Ini'
      },
      progress: {
        targetCal: 'Target Kalori',
        targetProtein: 'Target Protein'
      },
      charts: {
        volume7Days: 'Volume Latihan 7 Hari',
        cal7Days: 'Kalori 7 Hari'
      },
      chatbot: {
        title: '🤖 GymBot AI',
        subtitle: 'Personal trainer AI kamu',
        openChat: 'Buka Chat',
        welcome: 'Tanya apapun seputar gym, nutrisi, dan program latihan kamu!',
        q1: 'Apa itu progressive overload?',
        q2: 'Berapa protein idealku?',
        q3: 'Tips push day',
        noConnection: '❌ Koneksi gagal. Pastikan GEMINI_API_KEY sudah diset di Vercel.',
        placeholder: 'Tanya seputar gym...',
        send: 'Kirim',
        typing: '⏳ Sedang mengetik...',
        greeting: 'Halo! Saya GymBot, personal trainer AI kamu 💪 Tanya apa saja seputar gym, latihan, atau nutrisi!'
      },
      recentSessions: {
        title: 'Sesi Terakhir',
        empty: 'Belum ada sesi',
        all: 'Semua'
      },
      quickAction: {
        title: 'Quick Action',
        startWorkout: '🏋️ Mulai Workout',
        logMeal: '🍽️ Catat Makan',
        log: '📋 Log',
        stats: '📈 Statistik'
      }
    },
    workout: {
      startTitle: 'Mulai Workout',
      startSub: 'Pilih tipe workout hari ini',
      tipsTitle: 'Tips Sebelum Latihan',
      tips: [
        '💧 Minum 1-2 gelas air sebelum mulai',
        '🔥 Warm up 5-10 menit sebelum mulai',
        '📱 Tonton video form untuk gerakan baru',
        '📝 Catat beban tiap set untuk progressive overload'
      ],
      types: {
        push: 'Chest · Shoulder · Triceps',
        pull: 'Back · Biceps · Rear Delt',
        leg: 'Quads · Hamstring · Calves',
        full: 'Semua grup otot dalam 1 sesi',
        custom: 'Buat workout sesuai keinginan'
      },
      active: {
        pause: '⏸ Pause',
        resume: '▶ Resume',
        restTimer: '⏱ Rest Timer',
        setCompleted: 'set selesai',
        last: 'Terakhir',
        reps: 'Reps',
        weight: 'Berat (kg)',
        status: 'Status',
        addSet: '+ Set',
        addExercise: '+ Tambah Latihan',
        finish: '✓ Selesai',
        cancelMsg: 'Batalkan workout ini?'
      },
      addModal: {
        title: 'Tambah Latihan',
        muscleGroup: 'Grup Otot',
        chooseExercise: 'Pilih Latihan',
        placeholder: 'Atau ketik nama latihan...',
        add: 'Tambah'
      }
    },
    nutrition: {
      title: 'Catat Nutrisi',
      target: 'Target Harian',
      cal: 'Kalori',
      pro: 'Protein',
      addMeal: '+ Catat Makanan',
      historyTitle: 'Riwayat Makan Hari Ini',
      emptyMenu: 'Belum ada makanan hari ini',
      modal: {
        title: 'Tambah Makanan',
        food: 'Pilih Makanan',
        qty: 'Jumlah (porsi / 100g)'
      }
    },
    history: {
      title: 'Riwayat Latihan',
      empty: 'Belum ada riwayat latihan'
    },
    profile: {
      title: 'Profil & Target',
      name: 'Nama',
      weight: 'Berat Badan (kg)',
      targetCal: 'Target Kalori Harian',
      targetPro: 'Target Protein (g)',
      gymDays: 'Target Gym (hari/minggu)',
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
    dashboard: {
      loading: 'Loading...',
      morning: 'Good Morning',
      afternoon: 'Good Afternoon',
      evening: 'Good Evening',
      sessionsThisWeek: 'sessions this week',
      targetReached: '🎯 Target reached!',
      stats: {
        sessionThisWeek: 'Sessions This Week',
        volumeWeek: 'Weekly Volume',
        calToday: 'Calories Today',
        proteinToday: 'Protein Today'
      },
      progress: {
        targetCal: 'Target Calories',
        targetProtein: 'Target Protein'
      },
      charts: {
        volume7Days: '7 Days Volume',
        cal7Days: '7 Days Calories'
      },
      chatbot: {
        title: '🤖 GymBot AI',
        subtitle: 'Your AI personal trainer',
        openChat: 'Open Chat',
        welcome: 'Ask anything about gym, nutrition, and workout programs!',
        q1: 'What is progressive overload?',
        q2: 'What is my ideal protein?',
        q3: 'Push day tips',
        noConnection: '❌ Connection failed. Ensure GEMINI_API_KEY is set in Vercel.',
        placeholder: 'Ask about fitness...',
        send: 'Send',
        typing: '⏳ Typing...',
        greeting: 'Hello! I am GymBot, your AI personal trainer 💪 Ask me anything about gym, workout, or nutrition!'
      },
      recentSessions: {
        title: 'Recent Sessions',
        empty: 'No sessions yet',
        all: 'All'
      },
      quickAction: {
        title: 'Quick Action',
        startWorkout: '🏋️ Start Workout',
        logMeal: '🍽️ Log Meal',
        log: '📋 Log',
        stats: '📈 Stats'
      }
    },
    workout: {
      startTitle: 'Start Workout',
      startSub: 'Select today\'s workout type',
      tipsTitle: 'Pre-Workout Tips',
      tips: [
        '💧 Drink 1-2 glasses of water before starting',
        '🔥 Warm up for 5-10 minutes',
        '📱 Watch form videos for new movements',
        '📝 Log weight per set for progressive overload'
      ],
      types: {
        push: 'Chest · Shoulder · Triceps',
        pull: 'Back · Biceps · Rear Delt',
        leg: 'Quads · Hamstring · Calves',
        full: 'All muscle groups in 1 session',
        custom: 'Create a custom workout'
      },
      active: {
        pause: '⏸ Pause',
        resume: '▶ Resume',
        restTimer: '⏱ Rest Timer',
        setCompleted: 'sets completed',
        last: 'Last',
        reps: 'Reps',
        weight: 'Weight (kg)',
        status: 'Status',
        addSet: '+ Set',
        addExercise: '+ Add Exercise',
        finish: '✓ Finish',
        cancelMsg: 'Cancel this workout?'
      },
      addModal: {
        title: 'Add Exercise',
        muscleGroup: 'Muscle Group',
        chooseExercise: 'Choose Exercise',
        placeholder: 'Or type custom name...',
        add: 'Add'
      }
    },
    nutrition: {
      title: 'Log Nutrition',
      target: 'Daily Target',
      cal: 'Calories',
      pro: 'Protein',
      addMeal: '+ Add Meal',
      historyTitle: 'Today\'s Meal History',
      emptyMenu: 'No meals logged today',
      modal: {
        title: 'Add Food',
        food: 'Select Food',
        qty: 'Quantity (portion / 100g)'
      }
    },
    history: {
      title: 'Workout History',
      empty: 'No workout history yet'
    },
    profile: {
      title: 'Profile & Targets',
      name: 'Name',
      weight: 'Body Weight (kg)',
      targetCal: 'Daily Calorie Target',
      targetPro: 'Protein Target (g)',
      gymDays: 'Gym Target (days/week)',
    }
  }
};
