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
    theme: { toggle: 'Ganti tema' },
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
      loading: 'Memuat data...',
      morning: 'Selamat Pagi',
      afternoon: 'Selamat Siang',
      evening: 'Selamat Malam',
      sessionsThisWeek: 'sesi latihan minggu ini',
      targetReached: '🎯 Target Tercapai!',
      stats: {
        sessionThisWeek: 'Sesi Minggu Ini',
        volumeWeek: 'Volume Mingguan',
        calToday: 'Kalori Hari Ini',
        proteinToday: 'Protein Hari Ini'
      },
      progress: {
        targetCal: 'Target Kalori',
        targetProtein: 'Target Protein'
      },
      charts: {
        volume7Days: 'Volume Latihan 7 Hari',
        cal7Days: 'Konsumsi Kalori 7 Hari'
      },
      chatbot: {
        title: '🤖 GymBot AI',
        subtitle: 'Asisten Kebugaran Pribadi',
        openChat: 'Buka Chat',
        welcome: 'Tanyakan berbagai hal seputar kebugaran, nutrisi, maupun program latihan.',
        q1: 'Apa yang dimaksud dengan progressive overload?',
        q2: 'Berapa asupan protein harian yang ideal untuk saya?',
        q3: 'Saran latihan untuk hari Push Day',
        noConnection: '❌ Kegagalan koneksi. Harap pastikan variable GEMINI_API_KEY telah dikonfigurasi.',
        placeholder: 'Tanyakan seputar kebugaran...',
        send: 'Kirim',
        typing: '⏳ Sedang merespons...',
        greeting: 'Halo! Saya GymBot, asisten kebugaran AI Anda. Ajukan pertanyaan seputar kebugaran, metode latihan, atau nutrisi.'
      },
      recentSessions: {
        title: 'Sesi Latihan Terakhir',
        empty: 'Belum ada data sesi latihan',
        all: 'Seluruh Data'
      },
      quickAction: {
        title: 'Tindakan Cepat',
        startWorkout: '🏋️ Mulai Sesi Latihan',
        logMeal: '🍽️ Catat Nutrisi',
        log: '📋 Rekam Jejak',
        stats: '📈 Menu Statistik'
      }
    },
    workout: {
      startTitle: 'Mulai Sesi Latihan',
      startSub: 'Tentukan spesifikasi latihan untuk hari ini',
      tipsTitle: 'Rekomendasi Pra-Latihan',
      tips: [
        '💧 Konsumsi 1-2 gelas air agar tetap terhidrasi',
        '🔥 Lakukan pemanasan peregangan selama 5-10 menit',
        '📱 Lakukan penyesuaian postur secara akurat menggunakan panduan video',
        '📝 Lacak repetisi dan intensitas untuk mencapai progressive overload'
      ],
      types: {
        push: 'Dada · Bahu · Trisep (Push)',
        pull: 'Punggung · Bisep · Bahu Belakang (Pull)',
        leg: 'Paha Depan · Paha Belakang · Betis (Leg)',
        full: 'Keseluruhan kelompok otot (Full Body)',
        custom: 'Rancang sesi latihan khusus'
      },
      active: {
        pause: '⏸ Jeda Waktu',
        resume: '▶ Lanjutkan',
        restTimer: '⏱ Durasi Jeda',
        setCompleted: 'set terselesaikan',
        last: 'Sesi Sebelumnya',
        reps: 'Repetisi',
        weight: 'Intensitas (Kg)',
        status: 'Status',
        addSet: '+ Set Repetisi',
        addExercise: '+ Tambah Cabang Latihan',
        finish: '✓ Akhiri Sesi',
        cancelMsg: 'Apakah Anda yakin ingin membatalkan progres sesi latihan ini?'
      },
      addModal: {
        title: 'Pemilihan Menu Latihan',
        muscleGroup: 'Fokus Kelompok Otot',
        chooseExercise: 'Opsi Rekomendasi Latihan',
        placeholder: 'Cari atau isi gerakan latihan spesifik...',
        add: 'Tambahkan Latihan'
      }
    },
    nutrition: {
      title: 'Catatan Nutrisi',
      target: 'Pemantauan persentase kalori dan makronutrisi harian',
      cal: 'Kalori',
      pro: 'Protein',
      carbs: 'Karbohidrat',
      fat: 'Lemak',
      todayTarget: 'Ringkasan Asupan Hari Ini',
      calorieLeft: 'Defisit Kalori Diterima',
      proteinLeft: 'Defisit Protein Diterima',
      calc: '🔢 Kalkulator Nutrisi',
      photo: '📷 Deteksi via Foto',
      aiSearch: '✨ Pencarian via AI',
      manage: '⚙️ Manajemen Data',
      addMeal: '+ Catat Asupan',
      date: 'Tanggal Pemantauan:',
      historyTitle: 'Riwayat Konsumsi Harian',
      emptyMenu: 'Belum ada data nutrisi yang dicatat hari ini',
      emptyLogTitle: 'Laporan Konsumsi Kosong',
      emptyLogSub: 'Tambahkan data makanan untuk analisa target Anda',
      modal: {
        title: 'Data Asupan Baru',
        food: 'Rincian Menu',
        qty: 'Kuantitas/Gramatur'
      }
    },
    history: {
      title: 'Statistik & Riwayat',
      subtitle: 'Analisa komprehensif performa latihan dan nutrisi',
      empty: 'Catatan riwayat pelatihan belum tersedia',
      stats: {
        totalSessions: 'Total Sesi Latihan',
        totalVolume: 'Total Akumulasi Volume',
        totalExercise: 'Jenis Cabang Latihan',
        avgDuration: 'Durasi Rata-Masa',
        sessionsUnit: 'Sesi',
        tonUnit: 'Ton',
        exerciseUnit: 'Varian',
        minuteUnit: 'Menit'
      },
      filters: {
        sevenDays: 'Analisa 7 Hari',
        thirtyDays: 'Analisa 30 Hari'
      },
      charts: {
        volChart: 'Perkembangan Volume',
        calChart: 'Laporan Kalori',
        proChart: 'Laporan Protein',
        distChart: 'Distribusi Kinerja Otot',
        typeChart: 'Kategorisasi Latihan',
        emptyData: 'Data kalkulasi tidak tersedia'
      }
    },
    profile: {
      title: 'Profil Pengguna',
      subtitle: 'Pengaturan matriks personal dan objektif',
      personalData: 'Identifikasi Personal',
      name: 'Nama Pengguna',
      weight: 'Berat Badan (Kg)',
      height: 'Tinggi Badan (Cm)',
      goal: 'Objektif (Goal)',
      gymDays: 'Intensitas Sesi Mingguan',
      nutritionTargets: 'Penyesuaian Makronutrien',
      targetCal: 'Batas Kalori Harian (Kcal)',
      targetPro: 'Batas Protein Harian (Gr)',
      recBB: 'Estimasi Berat',
      recText: 'Direkomendasikan',
      saveChanges: 'Simpan Penyesuaian',
      saved: '✓ Perubahan Disimpan!',
      bodyStats: 'Bagan Fisik',
      bmi: 'Indeks Massa Tubuh (BMI)',
      idealWeight: 'Toleransi Berat Ideal',
      appearance: 'Pengaturan Tampilan',
      themeSwitch: 'Preferensi Warna Antarmuka'
    },
    logWorkout: {
      title: 'Rekam Jejak Sesi',
      subtitle: 'Arsip histori pelatihan komprehensif',
      newWorkout: '+ Sesi Pelatihan Baru',
      filterAll: 'Keseluruhan',
      exerciseLabel: 'Varian Latihan',
      minuteLabel: 'Satuan Menit',
      tonLabel: 'Tingkat Tonase',
      emptyTitle: 'Kekosongan Arsip',
      emptySub: 'Mulai dedikasi Anda pada kebugaran dari sesi perdana.',
      startFirst: 'Pelatihan Baru',
      deleteSession: '🗑️ Hapus Entri',
      deleteConfirm: 'Apakah Anda menyetujui untuk mencabut entri laporan ini secara permanen?'
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
    theme: { toggle: 'Toggle interface theme' },
    common: {
      loading: 'Loading...',
      cancel: 'Cancel',
      save: 'Save',
      add: 'Add',
      done: 'Complete',
      all: 'All',
      target: 'Target',
      today: 'Today'
    },
    dashboard: {
      loading: 'Initializing data...',
      morning: 'Good Morning',
      afternoon: 'Good Afternoon',
      evening: 'Good Evening',
      sessionsThisWeek: 'training sessions this week',
      targetReached: '🎯 Goal Achieved!',
      stats: {
        sessionThisWeek: 'Weekly Sessions',
        volumeWeek: 'Weekly Output',
        calToday: 'Daily Calories',
        proteinToday: 'Daily Protein'
      },
      progress: {
        targetCal: 'Calorie Goal',
        targetProtein: 'Protein Goal'
      },
      charts: {
        volume7Days: '7-Day Training Volume',
        cal7Days: '7-Day Caloric Intake'
      },
      chatbot: {
        title: '🤖 GymBot AI',
        subtitle: 'Your Dedicated Fitness Assistant',
        openChat: 'Access Chat',
        welcome: 'Inquire about fitness, nutrition strategies, and training regimens.',
        q1: 'Explain the concept of progressive overload.',
        q2: 'What constitutes an optimal daily protein intake?',
        q3: 'Recommendations for a comprehensive Push Day.',
        noConnection: '❌ Connection error. Please verify your GEMINI_API_KEY configuration in Vercel.',
        placeholder: 'Formulate your fitness inquiry...',
        send: 'Submit',
        typing: '⏳ Formulating response...',
        greeting: 'Greetings! I am GymBot, your AI fitness assistant. Please ask any questions regarding fitness, workouts, or nutritional science.'
      },
      recentSessions: {
        title: 'Recent Sessions Overview',
        empty: 'No activity recorded',
        all: 'View All Records'
      },
      quickAction: {
        title: 'Quick Actions',
        startWorkout: '🏋️ Initiate Workout',
        logMeal: '🍽️ Record Nutrition',
        log: '📋 View Logs',
        stats: '📈 Analytics'
      }
    },
    workout: {
      startTitle: 'Initiate Workout Session',
      startSub: 'Determine your targeted training parameters for today',
      tipsTitle: 'Pre-Workout Recommendations',
      tips: [
        '💧 Maintain hydration by consuming 1-2 glasses of water prior',
        '🔥 Perform dynamic stretching for 5-10 minutes',
        '📱 Ensure proper posture by reviewing form guidelines',
        '📝 Rigorously log your sets to guarantee progressive overload'
      ],
      types: {
        push: 'Chest · Shoulders · Triceps (Push Focus)',
        pull: 'Back · Biceps · Rear Delts (Pull Focus)',
        leg: 'Quadriceps · Hamstrings · Calves (Leg Focus)',
        full: 'Comprehensive Muscle Engagement (Full Body)',
        custom: 'Design a Customized Routine'
      },
      active: {
        pause: '⏸ Suspend Timer',
        resume: '▶ Proceed',
        restTimer: '⏱ Recovery Interval',
        setCompleted: 'sets fulfilled',
        last: 'Previous Record',
        reps: 'Repetitions',
        weight: 'Intensity (Kg)',
        status: 'Status',
        addSet: '+ Append Set',
        addExercise: '+ Append Exercise',
        finish: '✓ Finalize Session',
        cancelMsg: 'Are you certain you wish to abort the current workout progress?'
      },
      addModal: {
        title: 'Select Training Exercise',
        muscleGroup: 'Targeted Muscle Group',
        chooseExercise: 'Recommended Options',
        placeholder: 'Specify custom exercise nomenclature...',
        add: 'Include'
      }
    },
    nutrition: {
      title: 'Nutrition Log',
      target: 'Macro and caloric expenditure tracking',
      cal: 'Calories',
      pro: 'Protein',
      carbs: 'Carbohydrates',
      fat: 'Fats',
      todayTarget: 'Daily Consumption Overview',
      calorieLeft: 'Remaining Caloric Allowance',
      proteinLeft: 'Remaining Protein Allowance',
      calc: '🔢 Nutritional Calculator',
      photo: '📷 Visual Estimation Scanner',
      aiSearch: '✨ AI Query',
      manage: '⚙️ Data Management',
      addMeal: '+ Log Consumption',
      date: 'Monitoring Date:',
      historyTitle: 'Daily Dietary Record',
      emptyMenu: 'No nutritional data recorded today',
      emptyLogTitle: 'Dietary Report Unavailable',
      emptyLogSub: 'Record dietary input to establish analytical baselines',
      modal: {
        title: 'New Dietary Entry',
        food: 'Meal Identification',
        qty: 'Quantity/Serving'
      }
    },
    history: {
      title: 'Analytics & Trends',
      subtitle: 'Comprehensive evaluation of physiological and dietary progress',
      empty: 'Historical data logs are currently unpopulated',
      stats: {
        totalSessions: 'Lifetime Sessions',
        totalVolume: 'Cumulative Output',
        totalExercise: 'Exercise Variations',
        avgDuration: 'Mean Session Length',
        sessionsUnit: 'Entries',
        tonUnit: 'Tons',
        exerciseUnit: 'Variants',
        minuteUnit: 'Minutes'
      },
      filters: {
        sevenDays: '7-Day Period',
        thirtyDays: '30-Day Period'
      },
      charts: {
        volChart: 'Output Progression',
        calChart: 'Caloric Analysis',
        proChart: 'Protein Analysis',
        distChart: 'Muscle Engagement Distribution',
        typeChart: 'Training Categorization',
        emptyData: 'Insufficient metrics for calculation'
      }
    },
    profile: {
      title: 'User Profile',
      subtitle: 'Personalized matrix configurations and physiological objectives',
      personalData: 'Identification Information',
      name: 'User Identity',
      weight: 'Body Mass (Kg)',
      height: 'Stature (Cm)',
      goal: 'Primary Objective',
      gymDays: 'Weekly Training Frequency',
      nutritionTargets: 'Macronutrient Adjustments',
      targetCal: 'Daily Caloric Threshold (Kcal)',
      targetPro: 'Daily Protein Benchmark (Gr)',
      recBB: 'Weight Ref.',
      recText: 'Recommended Limit',
      saveChanges: 'Commit Alterations',
      saved: '✓ Modifications Recorded!',
      bodyStats: 'Physiological Chart',
      bmi: 'Body Mass Index (BMI)',
      idealWeight: 'Calculated Ideal Range',
      appearance: 'Display Preferences',
      themeSwitch: 'Adjust interface color contrast'
    },
    logWorkout: {
      title: 'Workout Archives',
      subtitle: 'Extensive repository of past training documentation',
      newWorkout: '+ Initiate New Routine',
      filterAll: 'Aggregate',
      exerciseLabel: 'Components',
      minuteLabel: 'Duration (m)',
      tonLabel: 'Tonnes',
      emptyTitle: 'Repository Unpopulated',
      emptySub: 'Commence your fitness dedication starting with your inaugural session.',
      startFirst: 'Begin Routine',
      deleteSession: '🗑️ Erase Record',
      deleteConfirm: 'Do you authorize the permanent deletion of this specific entry?'
    }
  }
};
