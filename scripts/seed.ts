import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DATABASE_PATH || './data/portfolio.db';

const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Drop old tables and recreate
db.exec(`
  DROP TABLE IF EXISTS site_content;
  DROP TABLE IF EXISTS project_media;
  DROP TABLE IF EXISTS sessions;
  DROP TABLE IF EXISTS rate_limits;
  DROP TABLE IF EXISTS audit_log;
  DROP TABLE IF EXISTS messages;
  DROP TABLE IF EXISTS posts;
  DROP TABLE IF EXISTS timeline;
  DROP TABLE IF EXISTS theses;
  DROP TABLE IF EXISTS patents;
  DROP TABLE IF EXISTS publications;
  DROP TABLE IF EXISTS projects;
  DROP TABLE IF EXISTS research_themes;
  DROP TABLE IF EXISTS users;
`);

db.exec(`
  CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL DEFAULT 'Admin',
    role TEXT NOT NULL DEFAULT 'admin' CHECK(role IN ('admin', 'editor')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE research_themes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    research_problem TEXT NOT NULL,
    motivation TEXT NOT NULL,
    approach TEXT NOT NULL,
    methodology TEXT,
    experimental_setup TEXT,
    hardware TEXT,
    data_acquisition TEXT,
    computational_method TEXT,
    results TEXT NOT NULL,
    key_contribution TEXT NOT NULL,status TEXT DEFAULT 'completed' CHECK(status IN ('completed', 'ongoing', 'under_review', 'filed')),
      featured INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    cover_image TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE publications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    authors TEXT NOT NULL,
    journal TEXT NOT NULL,
    year INTEGER NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('published', 'accepted', 'under_review', 'manuscript', 'preprint')),
    doi TEXT,
    abstract TEXT,
    research_area TEXT,
    pdf_url TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE patents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    inventors TEXT NOT NULL,
    applicant TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('granted', 'filed', 'pending', 'search_report')),
    description TEXT NOT NULL,
    innovation TEXT NOT NULL,
    research_area TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE theses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    degree TEXT NOT NULL,
    institution TEXT NOT NULL,
    supervisor TEXT NOT NULL,
    year TEXT NOT NULL,
    research_problem TEXT NOT NULL,
    objective TEXT NOT NULL,
    methodology TEXT NOT NULL,
    key_contributions TEXT NOT NULL,
    results TEXT NOT NULL,
    conclusions TEXT,
    future_work TEXT,
    pdf_url TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE timeline (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    date TEXT NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('education', 'research', 'publication', 'patent', 'project', 'startup', 'award')),
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    cover_image TEXT,
    published INTEGER DEFAULT 0,
    author_id INTEGER REFERENCES users(id),
    category TEXT DEFAULT 'research_notes',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    published_at DATETIME
  );
  CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    read INTEGER DEFAULT 0,
    ip_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL,
    resource TEXT,
    ip_address TEXT,
    user_agent TEXT,
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE rate_limits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL,
    count INTEGER DEFAULT 1,
    window_start DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    token_hash TEXT UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    revoked INTEGER DEFAULT 0
  );
  CREATE TABLE site_content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    page TEXT NOT NULL,
    key TEXT NOT NULL,
    value TEXT NOT NULL DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(page, key)
  );
  CREATE INDEX idx_site_content_page ON site_content(page);
  CREATE TABLE project_media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    media_type TEXT NOT NULL CHECK(media_type IN ('image', 'video', 'document')),
    caption TEXT,
    caption_title TEXT,
    section TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX idx_project_media_project ON project_media(project_id);
  CREATE INDEX idx_posts_slug ON posts(slug);
  CREATE INDEX idx_posts_published ON posts(published);
  CREATE INDEX idx_messages_read ON messages(read);
  CREATE INDEX idx_audit_log_user ON audit_log(user_id);
  CREATE INDEX idx_audit_log_created ON audit_log(created_at);
  CREATE INDEX idx_sessions_token ON sessions(token_hash);
  CREATE INDEX idx_projects_slug ON projects(slug);
  CREATE INDEX idx_publications_status ON publications(status);
  CREATE INDEX idx_timeline_category ON timeline(category);
`);

async function seed() {
  console.log('🌱 Seeding database with research data...');

  // --- Admin User ---
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail) {
    throw new Error('ADMIN_EMAIL environment variable is required but not set');
  }
  if (!adminPassword) {
    throw new Error('ADMIN_PASSWORD environment variable is required but not set');
  }
  if (adminPassword.length < 12) {
    throw new Error('ADMIN_PASSWORD must be at least 12 characters');
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  db.prepare('INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)').run(
    adminEmail, passwordHash, 'Raja Viveka Vardhan Siluveru', 'admin'
  );
  console.log('✅ Admin user created');

  // --- Research Themes ---
  const themes = [
    { title: 'Biomedical Imaging & Digital Cytology', description: 'Label-free autofluorescence microscopy, confocal AFI, multispectral imaging for non-invasive cancer screening at the single-cell level.', icon: '🔬', sort_order: 1 },
    { title: 'AI for Medical Diagnosis', description: 'Deep learning frameworks — denoising networks, synthetic augmentation, interpretable classifiers — for automated disease detection from imaging data.', icon: '🧠', sort_order: 2 },
    { title: 'Signal & Image Processing', description: 'Wavelet-domain methods, frequency-aware denoising, morphological feature extraction, and computational biosignal analysis.', icon: '📊', sort_order: 3 },
    { title: 'Microgravity Simulation Systems', description: 'IoT-enabled multi-modal clinostat/RPM platforms for space biology, cellular mechanotransduction, and microfluidic research.', icon: '🛰️', sort_order: 4 },
    { title: 'Medical Instrumentation & Prototyping', description: 'Hardware development — portable LED autofluorescence microscopes, ROS 2 sensor-fusion systems, and embedded edge-AI devices.', icon: '⚙️', sort_order: 5 },
    { title: 'Robotics & Embedded Systems', description: 'ROS 2 packages, Raspberry Pi–based instruments, stepper-motor control, IoT device management, and real-time sensor integration.', icon: '🤖', sort_order: 6 },
  ];
  const themeStmt = db.prepare('INSERT INTO research_themes (title, description, icon, sort_order) VALUES (?, ?, ?, ?)');
  for (const t of themes) themeStmt.run(t.title, t.description, t.icon, t.sort_order);
  console.log('✅ Research themes created');

  // --- Research Projects ---
  const projects = [
    {
      title: 'Non-Invasive AI Framework for Oral Cancer Detection via Autofluorescence Imaging',
      slug: 'oral-cancer-afi',
      research_problem: 'Oral cancer accounts for approximately 1.9% of annual cancer-related deaths worldwide, with a 5-year survival rate of only 50–55%. Diagnosis relies on invasive biopsy, which is time-consuming, requires tissue staining, and is subject to inter-observer variability. There is a critical need for a non-invasive, rapid, and accurate screening method.',
      motivation: 'Label-free autofluorescence imaging (AFI) of exfoliated buccal cells captures metabolic and morphological changes associated with malignant transformation — before obvious morphological abnormalities appear. However, clinical adoption is limited by low signal-to-noise ratio, photon-dependent noise, small and imbalanced datasets, and the lack of robust AI models.',
      approach: 'A unified, quality-controlled AFI research pipeline integrating: (1) multispectral confocal acquisition at 405/488/638 nm, (2) FASCANet frequency-aware denoising, (3) class-conditional StyleGAN2-ADA synthetic augmentation with texture-preserving loss, (4) automated quality-control screening, (5) AFiS-Net dual-branch classifier with cross-attention fusion, and (6) independent risk screening on unseen cohorts.',
      methodology: 'Exfoliated buccal cells from non-smoker, susceptible (tobacco smokers), and histologically confirmed oral cancer cohorts were imaged without exogenous labels using a Leica STELLARIS 5 laser scanning confocal microscope. Images were acquired at 405, 488, and 638 nm excitation, registered as pseudo-RGB composites, and cropped to 256×256 single-cell regions of interest.',
      experimental_setup: 'Leica STELLARIS 5 laser scanning confocal microscope with LAS X software. Three-channel acquisition: blue (410–480 nm), green (490–600 nm), red (650–750 nm). All acquisition parameters kept constant to avoid signal saturation.',
      hardware: 'Leica STELLARIS 5 confocal microscope, glass slides, phosphate-buffered saline, centrifuge for cell pelleting.',
      data_acquisition: 'Three spectral channels (405/488/638 nm excitation) → 1024×1024 fields → spatial co-registration → pseudo-RGB composites → 256×256 single-cell ROI crops → Otsu-based foreground extraction.',
      computational_method: 'FASCANet: db2 wavelet decomposition → dual residual frequency branches → bidirectional Spatial Cross-Attention (SCA) → inverse wavelet reconstruction. AFiS-Net: ConvNeXt V2 + SwinV2 Transformer dual-branch with cross-attention fusion and generalized mean pooling.',
      results: 'Denoising: PSNR 38.79 ± 2.30 dB, SSIM 0.90 ± 0.04 under mixed Poisson-Gaussian noise. Synthetic augmentation: KID reduced 20.45–25.74%, FID reduced 8.70–9.60%. Classification: macro F1 = 0.879 ± 0.035, AUC = 0.948 ± 0.029, MCC = 0.769 ± 0.064 under ROI-grouped 5-fold cross-validation. Cancer precision improved from 0.86 to 0.96; specificity from 0.94 to 0.98 after denoising.',
      key_contribution: 'A complete quality-controlled AFI research pipeline — from acquisition through denoising, synthetic augmentation, group-aware classification, and independent risk screening — demonstrating that label-free autofluorescence cytology can support non-invasive oral cancer triage. Grad-CAM++ localised predictions to nuclear/perinuclear regions. Independent screening showed ordered normal→smoker→cancer probability continuum (Spearman ρ = 0.857).',
      status: 'under_review',
      featured: 1,
      sort_order: 1,
      cover_image: '/research/oral-cancer/fig6_workflow_overview.png',
    },
    {
      title: 'FASCANet: Frequency-Aware Spatial Cross-Attention Denoising for Label-Free Oral Cancer Screening',
      slug: 'fascanet-denoising',
      research_problem: 'Autofluorescence imaging of oral epithelial cells suffers from extremely low SNR due to weak intrinsic fluorophore emission combined with photon shot noise and detector read noise. Existing denoising methods either over-smooth metabolite-specific textures or require clean reference images that are impractical to acquire in clinical AFI.',
      motivation: 'No existing noise-supervised denoising method addresses the joint requirements of Poisson-Gaussian noise suppression and metabolic-texture preservation in label-free autofluorescence data. Context-based self-supervised methods promote local smoothness, which destroys the fine spectral contrast carrying diagnostic information.',
      approach: 'FASCANet operates in the wavelet domain, where autofluorescence noise and metabolic signal occupy distinct frequency bands. A single-level db2 wavelet decomposition separates the input into low-frequency approximation and high-frequency detail subbands, which are processed by two parallel residual branches coupled by a Spatial Cross-Attention module.',
      methodology: 'Trained under a Noisier2Noise protocol without any clean reference images. Input images are decomposed by a single-level 2D Daubechies-2 (db2) discrete wavelet transform. Low-frequency and high-frequency subbands are processed by parallel residual branches with bidirectional spatial cross-attention after every pair of residual blocks.',
      experimental_setup: 'Evaluated under Gaussian, Poisson, and mixed Poisson-Gaussian noise conditions across three independent random seeds. Tested against BM3D, Noise2Void, Noise2Same, Self2Self, Neighbor2Neighbor, Deep Image Prior, and a SwinConv hybrid baseline.',
      hardware: 'Computational — GPU-based training pipeline. No hardware-specific requirements beyond standard deep learning infrastructure.',
      data_acquisition: 'Same confocal AFI dataset as the integrated framework. Mixed Poisson-Gaussian noise added at controlled levels for denoising evaluation.',
      computational_method: 'db2 wavelet decomposition → dual residual frequency branches (96 channels each, 6 residual blocks) → Spatial Cross-Attention (SCA) module with additive residual gating + Group Normalization → fusion block → 1×1 tail convolution → 12 residual channels → inverse db2 transform.',
      results: 'PSNR 38.79 ± 2.30 dB, SSIM 0.90 ± 0.04. Outperformed BM3D, Noise2Void, Noise2Same, Self2Self, Neighbor2Neighbor, DIP, and SwinConv hybrid on PSNR, SSIM, VIF, FSIM, and MS-SSIM. Downstream cancer precision: 0.86 → 0.96, specificity: 0.94 → 0.98. Preserved optical NADH/FAD redox-ratio ordering.',
      key_contribution: 'First noise-supervised wavelet-domain denoising network specifically designed for label-free autofluorescence imaging. Trained without clean references via Noisier2Noise. Spatial Cross-Attention enables bidirectional frequency-band information exchange. Preserves metabolically relevant fluorophore intensity relationships while removing diagnostic noise.',
      status: 'under_review',
      featured: 1,
      sort_order: 2,
      cover_image: '/research/oral-cancer/model.png',
    },
    {
      title: 'Automated Multi-Modal Microgravity-on-a-Chip Simulation Platform',
      slug: 'microgravity-platform',
      research_problem: 'Microgravity research on Earth requires reliable simulation of reduced-gravity environments. Existing clinostats and Random Positioning Machines (RPMs) operate in single modes, lack wireless control, and cannot accommodate modern microfluidic and Lab-on-Chip (LoC) formats. There is no unified platform combining multiple gravity simulation modes with planetary gravity profiles and remote operation.',
      motivation: 'Space biology, cellular mechanotransduction, pharmaceutical research, and tissue engineering require reproducible, remotely operable microgravity simulation. Current instruments are mode-limited, not IoT-enabled, and cannot support the "Microgravity-on-Chip" paradigm for high-throughput, low-volume parallel experiments.',
      approach: 'An IoT-enabled, wirelessly controlled dual-axis gimbal clinostat/RPM platform with a novel Hybrid Clinostat–RPM mode. Automated planetary gravity profile algorithms simulate Earth (1 g), Moon (0.166 g), Mars (0.376 g), and Space microgravity (~0 g). Universal Sample Holding Module (USHM) accommodates T25 flasks, well plates, microfluidic devices, and LoC carriers.',
      methodology: 'Dual NEMA 14 stepper motors with TMC2209 UART drivers provide low-noise, high-precision dual-axis rotation. Raspberry Pi 3 central computing unit with Wi-Fi mobile-app GUI and live camera telemetry. A unified mathematical framework continuously computes and displays the time-averaged residual gravitational vector.',
      experimental_setup: 'Dual-axis gimbal mechanics with NEMA 14 stepper motors and TMC2209 silent step drivers. Raspberry Pi 3 controller with integrated camera module. Mobile application for wireless parameter configuration and real-time monitoring.',
      hardware: 'Dual NEMA 14 stepper motors, TMC2209 UART silent stepper drivers, Raspberry Pi 3, Raspberry Pi Camera Module, Wi-Fi module, Universal Sample Holding Module (T25 flasks, well plates, microfluidic devices, LoC carriers).',
      data_acquisition: 'Real-time live video monitoring via integrated Raspberry Pi Camera Module. Continuous Gavg computation and display across all operational modes.',
      computational_method: 'Embedded mathematical framework for real-time computation of time-averaged residual gravitational acceleration across 2D clinostat, 3D clinostat, RPM, and Hybrid Clinostat–RPM modes.',
      results: 'PIC novelty search report obtained. Four operational modes: 2D clinostat, 3D clinostat, RPM, and Hybrid Clinostat–RPM. Planetary gravity profiles for Earth, Moon, Mars, and Space. USHM accommodates standard cell culture formats. Wireless remote control via mobile app with live camera feed.',
      key_contribution: 'Novel Hybrid Clinostat–RPM mode. "Microgravity-on-Chip" concept miniaturizing experiments to chip scale. IoT-enabled wireless control with live video telemetry. Unified real-time gravitational vector computation. Universal Sample Holding Module for diverse experimental formats.',
      status: 'filed',
      featured: 1,
      sort_order: 3,
      cover_image: '/research/microgravity/WhatsApp Image 2026-05-15 at 10.04.52.jpeg',
    },
    {
      title: 'Label-Free Autofluorescence Microscope & Cell-Segmentation Pipeline (OncoSpectrix)',
      slug: 'oncospectrix-microscope',
      research_problem: 'Conventional oral cancer screening requires invasive biopsy and histopathological staining. 60–80% of oral cancers in India are diagnosed at Stage III/IV. There is a critical need for a portable, low-cost, label-free imaging system that can perform cell-level analysis at the point of care without requiring expensive laboratory infrastructure. The system must handle image acquisition, cell segmentation, denoising, feature extraction, and preliminary screening on edge without cloud connectivity.',
      motivation: 'Translating the AFI-based screening pipeline from a benchtop Leica STELLARIS 5 confocal microscope to a portable, affordable LED-based device for clinical deployment. The system must be deployable in resource-limited settings where conventional biopsy-based methods are impractical.',
      approach: 'A portable LED autofluorescence microscope built on a Raspberry Pi 5 with an integrated software pipeline for: (1) LED-based autofluorescence image acquisition at 405/488/638 nm wavelengths, (2) brightfield oral-cell segmentation using watershed methods, (3) FASCANet deep-learning denoising on edge, (4) CAFNet-Hybrid classification with cancer probability scoring, and (5) real-time risk assessment. LED excitation wavelengths map to specific cellular metabolites: 405 nm for NAD(P)H emission (440-460 nm), 465 nm for FAD/flavins (510-540 nm), 520 nm for Lipofuscin-like fluorophores (600-700 nm). This captures the metabolic signatures associated with malignant transformation. The complete pipeline (acquisition, segmentation, denoising, classification, risk scoring) runs entirely on the Raspberry Pi 5, eliminating cloud dependency.',
      methodology: 'Sample collection: Exfoliated buccal cells collected using cotton swab, mixed in PBS inoculum, centrifuged, and prepared as smear on slides. Three study groups: normal (non-smokers), smoker (>4 cigarettes/day for >5 years), and histologically confirmed cancer. Image acquisition: LED excitation at 405 nm (blue), 488 nm (green), and 638 nm (red) channels. Images captured and registered as pseudo-RGB composites. Single-cell ROIs extracted at 256x256 resolution. Software pipeline: (1) Autofluorescence image acquisition with multi-channel LED control. (2) Brightfield imaging for cell segmentation reference. (3) Watershed-based cell segmentation. (4) FASCANet denoising inference on edge. (5) CAFNet-Hybrid classification with cancer probability scoring. (6) Real-time risk assessment and display. LED excitation sources replace laser-based confocal illumination for cost reduction. Raspberry Pi 5 provides sufficient compute for real-time segmentation and FASCANet/CAFNet inference.',
      experimental_setup: 'Custom-built portable LED autofluorescence microscope on Raspberry Pi 5 platform. Integrated acquisition and analysis pipeline running entirely on edge. Custom-built software interface with multi-channel acquisition control, live ROI capture, brightfield segmentation, on-edge denoising, and rapid screening modes.',
      hardware: 'Raspberry Pi 5, LED excitation sources (405/488/638 nm), camera module, custom microscope optics enclosure. Illumination circuit with programmable LED drivers for multi-wavelength excitation.',
      data_acquisition: 'Three-channel LED-based autofluorescence excitation: blue (405 nm), green (488 nm), red (638 nm). Brightfield reference for cell segmentation. Live ROI capture for real-time single-cell extraction. Common ROI selection across all spectral channels.',
      computational_method: 'Watershed-based cell segmentation from brightfield reference images. FASCANet denoising — db2 wavelet decomposition with Spatial Cross-Attention — running on edge without cloud connectivity. CAFNet-Hybrid classification: ConvNeXt V2-Nano (local texture) + SwinV2-Tiny (global context) with cross-attention fusion. Real-time cancer probability scoring and risk assessment.',
      results: 'Functional prototype demonstrating label-free autofluorescence imaging at three excitation wavelengths, automated watershed-based cell segmentation, on-edge FASCANet denoising with PSNR 37.15 dB and SSIM 0.84, CAFNet-Hybrid classification with macro F1 = 0.879 and AUC = 0.948, cancer precision improved from 0.86 to 0.96 and specificity from 0.94 to 0.98, ordered normal-smoker-cancer probability continuum, complete pipeline running locally on Raspberry Pi 5, portable form factor suitable for point-of-care deployment.',
      key_contribution: 'Translation of benchtop confocal AFI pipeline to a portable, affordable LED-based device. On-edge computation eliminates cloud dependency. Integrated acquisition → segmentation → denoising → classification → risk scoring pipeline. Foundation for OncoSpectrix commercial platform with IEC clinical approvals. Demonstrates that the complete AI diagnostic pipeline can run locally on a Raspberry Pi 5 for clinical screening in resource-limited settings.',
      status: 'ongoing',
      featured: 1,
      sort_order: 4,
      cover_image: '/research/microscope/20260702_11h59m25s_grim.png',
    },
    {
      title: 'Coal Volume Estimation System — ROS 2 Camera-LiDAR Sensor-Fusion Package',
      slug: 'coal-volume-estimation',
      research_problem: 'Accurate real-time measurement of bulk material volume and mass flow rate on industrial conveyor belts is critical for process control and inventory management. Existing systems rely on manual measurement or expensive commercial solutions.',
      motivation: 'Develop an open-source, ROS 2–based sensor-fusion package that combines computer vision (PiCamera2 + YOLO segmentation) with 2D LiDAR depth profiling for real-time volumetric and mass flow-rate measurement on industrial conveyors.',
      approach: 'An 8-node ROS 2 (Jazzy) package fusing PiCamera2/YOLO-segmented coal-mask occupancy with a downward RPLIDAR 2D depth profile. Deployed on Raspberry Pi 4 for real-time processing.',
      methodology: 'PiCamera2 captures conveyor images; YOLO segmentation generates coal-mask occupancy maps; RPLIDAR provides 2D depth profiles; sensor fusion computes cross-sectional area, volume flow rate, mass flow rate, and cumulative measurements.',
      experimental_setup: 'Raspberry Pi 4 with PiCamera2, RPLIDAR 2D LiDAR sensor mounted above industrial conveyor. ROS 2 Jazzy with 8 processing nodes.',
      hardware: 'Raspberry Pi 4, PiCamera2, RPLIDAR 2D LiDAR, industrial conveyor system.',
      data_acquisition: 'Real-time camera frames at conveyor belt speed. 2D LiDAR depth profiles at high update rate. YOLO segmentation for coal region detection.',
      computational_method: '8-node ROS 2 pipeline: camera acquisition → YOLO segmentation → coal mask generation → LiDAR depth profiling → sensor fusion → volumetric computation → mass flow estimation → data logging.',
      results: 'Real-time measurement of cross-sectional area (0.011–0.012 m²), volume flow rate (~0.017 m³/s), mass flow rate (~14.8 kg/s, ~53 tonnes/hour), belt speed (1.5 m/s), density estimation (850 kg/m³). Confidence metric computed per scan.',
      key_contribution: 'Open-source ROS 2 sensor-fusion package for industrial bulk material measurement. Real-time volumetric and mass flow-rate computation on edge. YOLO-based segmentation for non-uniform material profiles.',
      status: 'completed',
      featured: 0,
      sort_order: 5,
      cover_image: '/research/coal-volume/scan_map.png',
    },
    {
      title: 'Cannabis-Consumption Detection via ECG Morphological Features and Machine Learning',
      slug: 'ecg-cannabis-detection',
      research_problem: 'Detecting cannabis consumption through non-invasive physiological measurements. Current methods rely on blood/urine tests, which are invasive, time-consuming, and have limited detection windows. An ECG-based approach could provide rapid, non-invasive screening.',
      motivation: 'Cannabis use affects cardiac electrophysiology through alterations in autonomic nervous system regulation. Morphological features in ECG signals — RR interval, QRS duration/amplitude, P-wave and T-wave parameters — may carry discriminative information for identifying cannabis consumers.',
      approach: 'A complete MATLAB ECG processing pipeline with bandpass/notch filtering, db4 wavelet baseline-wander removal, Pan-Tompkins QRS detection, and morphological feature extraction. Nine ML classifiers benchmarked on a 200-subject cohort.',
      methodology: '200 subjects (100 normal, 100 cannabis-consuming). ECG processed through: bandpass filter → notch filter → db4 wavelet baseline removal → Pan-Tompkins delineation → morphological feature extraction (RR interval, QRS duration/amplitude, P-wave duration/amplitude, T-wave duration/amplitude).',
      experimental_setup: 'Clinical ECG recordings from 200 subjects. MATLAB-based processing pipeline. Statistical validation via Mann-Whitney U testing.',
      hardware: 'Clinical ECG acquisition system. MATLAB processing environment.',
      data_acquisition: '200-subject ECG dataset (100 normal, 100 cannabis-consuming). Standard lead ECG recordings.',
      computational_method: 'Bandpass/notch filtering → db4 wavelet baseline removal → Pan-Tompkins QRS detection → morphological feature extraction → 9 ML classifiers (Gradient Boosting, XGBoost, Random Forest, SVM, KNN, Naive Bayes, Logistic Regression, Decision Tree, RNN-LSTM).',
      results: 'Gradient Boosting achieved best accuracy: 92%, AUC 0.98. XGBoost and Random Forest: 90% each. RNN(LSTM): 87%. Mann-Whitney U testing: p < 0.001 for R-wave amplitude, RR interval, QRS duration, P-wave and T-wave amplitude. 6-fold cross-validation: 89% accuracy.',
      key_contribution: 'First ML-based ECG morphological approach for cannabis consumption detection. Statistically validated group separation. Benchmarking of 9 classifiers with Gradient Boosting as top performer. Demonstrated feasibility of non-invasive cannabis screening via cardiac electrophysiology.',
      status: 'completed',
      featured: 0,
      sort_order: 6,
      cover_image: '/research/ecg-cannabis-detection/corer.png',
    },
  ];

  const projStmt = db.prepare(`INSERT INTO projects (title, slug, research_problem, motivation, approach, methodology, experimental_setup, hardware, data_acquisition, computational_method, results, key_contribution, status, featured, sort_order, cover_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

  for (const p of projects) {
    projStmt.run(p.title, p.slug, p.research_problem, p.motivation, p.approach, p.methodology, p.experimental_setup, p.hardware, p.data_acquisition, p.computational_method, p.results, p.key_contribution, p.status, p.featured, p.sort_order, p.cover_image);
  }
  console.log('✅ Research projects created');

  // --- Publications ---
  const pubs = [
    {
      title: 'Synthetic Augmentation for Label-free Digital Cytology of Oral Cancer Screening',
      authors: 'S. R. V. Vardhan, Sk Sher Md, M. Pal, A. Barui',
      journal: 'Computers in Biology and Medicine (Elsevier)',
      year: 2026,
      status: 'under_review',
      abstract: 'Designed a class-conditional StyleGAN2-ADA generator with a novel texture-preserving loss for autofluorescence cytology synthesis, cutting KID by 20.45–25.74% and FID by 8.70–9.60% without loss of diversity. Built an automated quality-control pipeline (DINOv2/CLIP similarity, LPIPS, class-margin and memorisation filters) that screened 2,000 synthetic images down to 215 for training augmentation. Developed AFiS-Net, a ConvNeXt V2–SwinV2 Transformer dual-branch classifier with cross-attention fusion; achieved macro F1 = 0.879 ± 0.035 and AUC = 0.948 ± 0.029 under leakage-safe, ROI-grouped 5-fold cross-validation. Cancer precision improved from 0.86 to 0.96 and specificity from 0.94 to 0.98 after denoising and augmentation. Independent screening on an unseen cohort demonstrated an ordered normal→smoker→cancer probability continuum (Spearman ρ = 0.857), confirming that the feature-space progression is biologically meaningful and not a smoker diagnosis.  Problem addressed: Label-free autofluorescence imaging (AFI) of exfoliated buccal cells provides non-invasive metabolic and morphological contrast for oral cancer screening, but its diagnostic value is limited by photon-dependent noise, small and imbalanced datasets, and the lack of robust AI models trained with rigorous group-aware validation.  Methodology: Exfoliated buccal cells from non-smoker, susceptible (tobacco smokers), and histologically confirmed oral cancer cohorts were imaged at 405/488/638 nm using a Leica STELLARIS 5 confocal microscope. A unified quality-controlled AFI pipeline was developed: (1) FASCANet frequency-aware denoising, (2) class-conditional StyleGAN2-ADA synthetic augmentation with texture-preserving loss, (3) automated quality-control screening of 2,000 generated candidates to 215 retained images, and (4) AFiS-Net dual-branch classification with cross-attention fusion.  Key contribution: A complete quality-controlled AFI research pipeline demonstrating that synthetic augmentation is most useful when generated images are rigorously screened and performance is evaluated with group-aware splits. The proposed system is intended as a triage framework, not a replacement for biopsy or histopathology.  Related project: Non-Invasive AI Framework for Oral Cancer Detection via Autofluorescence Imaging.',
      doi: null,
      research_area: 'Biomedical Imaging, AI for Cancer Screening',
      sort_order: 1,
    },
    {
      title: 'FASCANet: Frequency-Aware Spatial Cross-Attention Denoising for Label-Free Oral Cancer Screening from Autofluorescent Images',
      authors: 'S. R. V. Vardhan, Sk Sher Md, M. Pal, A. Barui',
      journal: 'IEEE Journal of Biomedical and Health Informatics (IEEE JBHI)',
      year: 2026,
      status: 'under_review',
      abstract: 'Designed FASCANet, a Noisier2Noise-trained, db2 wavelet-domain dual-branch residual network coupled by a Spatial Cross-Attention module, requiring no clean reference images. Achieved PSNR 38.79 ± 2.30 dB / SSIM 0.90 ± 0.04 under mixed Poisson-Gaussian noise, outperforming BM3D, Noise2Void, Noise2Same, Self2Self, Neighbor2Neighbor, DIP and a SwinConv hybrid baseline. Improved downstream 3-class classification: cancer precision 0.86 → 0.96 and specificity 0.94 → 0.98, while preserving the optical NADH/FAD redox-ratio ordering across groups.  Problem addressed: Autofluorescence imaging of oral epithelial cells suffers from extremely low SNR due to weak intrinsic fluorophore emission combined with photon shot noise and detector read noise. Existing denoising methods either over-smooth metabolite-specific textures or require clean reference images that are impractical to acquire in clinical AFI.  Methodology: FASCANet operates in the wavelet domain, where autofluorescence noise and metabolic signal occupy distinct frequency bands. A single-level db2 wavelet decomposition separates the input into low-frequency approximation and high-frequency detail subbands, which are processed by two parallel residual branches coupled by a Spatial Cross-Attention module. Trained under a Noisier2Noise protocol without any clean reference images. Evaluated under Gaussian, Poisson, and mixed Poisson-Gaussian noise conditions across three independent random seeds.  Key contribution: First noise-supervised wavelet-domain denoising network specifically designed for label-free autofluorescence imaging. Spatial Cross-Attention enables bidirectional frequency-band information exchange. Preserves metabolically relevant fluorophore intensity relationships while removing diagnostic noise.  Related project: FASCANet Denoising Network.',
      research_area: 'Biomedical Imaging, Denoising, Deep Learning',
      sort_order: 2,
    },
  ];

  const pubStmt = db.prepare('INSERT INTO publications (title, authors, journal, year, status, abstract, research_area, doi, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
  for (const p of pubs) pubStmt.run(p.title, p.authors, p.journal, p.year, p.status, p.abstract, p.research_area, p.doi || null, p.sort_order);
  console.log('✅ Publications created');

  // --- Patents ---
  const patents = [
    {
      title: 'Automated Multi-Modal Microgravity-on-a-Chip Simulation Platform',
      inventors: 'A. Sarkar, S. R. V. Vardhan, Dr. A. Barui',
      applicant: 'Indian Institute of Engineering Science and Technology (IIEST), Shibpur',
      status: 'search_report',
      description: 'An IoT-enabled, wirelessly controlled dual-axis gimbal clinostat/RPM platform with a novel Hybrid Clinostat–RPM mode, designed for space biology, cellular mechanotransduction, pharmaceutical research, and tissue engineering. The system simulates Earth (1 g), Moon (0.166 g), Mars (0.376 g), and Space microgravity (~0 g) via automated planetary gravity profile algorithms and real-time time-averaged residual gravitational vector (Gavg) computation.  Engineering stack: Dual NEMA 14 stepper motors with TMC2209 UART silent drivers for low-noise, high-precision dual-axis rotation. Raspberry Pi 3 central computing unit with Wi-Fi mobile-app GUI and live camera telemetry. Universal Sample Holding Module (USHM) accommodating T25 flasks, well plates, microfluidic devices, Lab-on-Chip carriers, and centrifuge tubes.  Operational modes: 2D clinostat, 3D clinostat, Random Positioning Machine (RPM), and the novel Hybrid Clinostat–RPM mode. A unified mathematical framework continuously computes and displays the time-averaged residual gravitational acceleration vector across all modes.  Motivation: Existing clinostats and RPMs operate in single modes, lack wireless control, and cannot accommodate modern microfluidic and LoC formats. There is no unified platform combining multiple gravity simulation modes with planetary gravity profiles and remote operation.  System description: The Microgravity-on-Chip (MoC) concept miniaturizes experiments to chip scale, enabling high-throughput, low-volume parallel experiments. The platform provides reproducible, remotely operable microgravity simulation with real-time monitoring.  Application: Space biology research, cellular mechanotransduction studies, pharmaceutical research, tissue engineering, and microfluidic/LoC-based experiments requiring controlled gravity simulation.  Status: PIC novelty search report obtained. Patent application filed at IIEST Shibpur through IPR cell.  Related research project: Automated Multi-Modal Microgravity-on-a-Chip Simulation Platform.',
      innovation: 'Novel Hybrid Clinostat–RPM mode combining clinostat rotation with random positioning in a single platform. Microgravity-on-Chip (MoC) concept miniaturizing experiments to chip scale for high-throughput parallel experiments. IoT-enabled wireless control with real-time camera telemetry and live Gavg computation. Universal Sample Holding Module for diverse experimental formats (T25 flasks, well plates, microfluidic devices, LoC carriers). Automated planetary gravity profile simulation for Earth, Moon, Mars, and Space microgravity. Unified mathematical framework for continuous residual gravitational vector computation.  Main technical contribution: The Hybrid Clinostat–RPM mode is a novel operational paradigm that combines the rotational averaging of a clinostat with the random orientation capability of an RPM, providing more complete gravity averaging than either mode alone. The IoT-enabled architecture enables remote operation and real-time monitoring, critical for long-duration space biology experiments.',
      research_area: 'Microgravity Simulation, Space Biology, IoT Instrumentation',
      sort_order: 1,
    },
    {
      title: 'Label-free Autofluorescence Imaging Device & AI-based Screening Method for Oral Cancer',
      inventors: 'S. R. V. Vardhan, Sk Sher Md, M. Pal, A. Barui',
      applicant: 'IIEST Shibpur, with AI4ICPS I-Hub Foundation (IIT Kharagpur) as co-IP party',
      status: 'search_report',
      description: 'Patent documentation for the OncoSpectrix hardware + AI diagnostic platform — a complete integrated system for label-free, non-invasive oral cancer screening at the point of care.  Technology: The system combines a portable LED-based autofluorescence microscope with an embedded AI diagnostic pipeline. LED excitation sources at 405/488/638 nm replace laser-based confocal illumination for cost reduction. Raspberry Pi 5 provides sufficient compute for real-time segmentation and inference. The complete pipeline runs on-edge without cloud connectivity.  System description: Hardware components include custom microscope optics enclosure, multi-wavelength LED excitation module, camera module, and Raspberry Pi 5 controller. Software pipeline includes: (1) LED-based autofluorescence image acquisition, (2) brightfield oral-cell segmentation using watershed methods, (3) deep-learning denoising on edge (FASCANet), (4) feature extraction and preliminary screening using CAFNet-Hybrid classifier.  Motivation: Conventional oral cancer screening requires invasive biopsy and histopathological staining. There is a critical need for a portable, low-cost, label-free imaging system that can perform cell-level analysis at the point of care without requiring expensive laboratory infrastructure.  Innovation: Integration of label-free AFI hardware with AI-based diagnostic pipeline in a portable, affordable form factor. On-edge computation eliminates cloud dependency, enabling deployment in resource-constrained clinical environments. The system provides real-time risk scoring and cancer probability directly on the microscope.  Incorporates four newly identified prior-art patents and two non-patent literature items into the comparison report. PIC novelty search report obtained.  Application: Point-of-care oral cancer screening in resource-limited settings, clinical deployment in primary care facilities, field screening in regions with limited access to specialist care.  Related research project: Label-Free Autofluorescence Microscope & Cell-Segmentation Pipeline (OncoSpectrix).',
      innovation: 'Integrated label-free AFI hardware with AI-based diagnostic pipeline for non-invasive oral cancer screening. Portable, affordable form factor suitable for point-of-care deployment. On-edge computation eliminates cloud dependency — complete pipeline (acquisition → segmentation → denoising → classification → risk scoring) runs locally on Raspberry Pi 5. Custom-built microscope optics with multi-wavelength LED excitation at 405/488/638 nm. Real-time cancer probability and risk scoring displayed directly on the device.  Main technical contribution: Translation of a benchtop confocal AFI pipeline to a portable, LED-based device with on-edge AI inference. The OncoSpectrix platform demonstrates that the complete denoising → synthetic augmentation → classification pipeline can be deployed in a portable form factor for clinical screening applications.',
      research_area: 'Biomedical Imaging, Medical Device, AI Diagnostics',
      sort_order: 2,
    },
  ];

  const patStmt = db.prepare('INSERT INTO patents (title, inventors, applicant, status, description, innovation, research_area, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  for (const p of patents) patStmt.run(p.title, p.inventors, p.applicant, p.status, p.description, p.innovation, p.research_area, p.sort_order);
  console.log('✅ Patents created');

  // --- Theses ---
  const theses = [
    {
      title: 'A Non-Invasive AI-Based Framework for Early Oral Cancer Detection Using Autofluorescence Imaging',
      degree: 'Master of Technology (M.Tech)',
      institution: 'Centre for Healthcare Science and Technology, Indian Institute of Engineering Science and Technology (IIEST), Shibpur',
      supervisor: 'Dr. Ananya Barui',
      year: '2024–2026',
      research_problem: 'Early detection of oral cancer remains difficult because definitive diagnosis requires an invasive biopsy, and robust AI models require well-curated imaging data. Oral cancer accounts for approximately 1.9% of annual cancer-related deaths worldwide, with a 5-year survival rate of only 50–55%. 60–80% of oral cancers in India are diagnosed at Stage III/IV. Label-free autofluorescence imaging (AFI) of exfoliated buccal cells provides non-invasive metabolic and morphological contrast, but its diagnostic value is limited by photon-dependent noise, small and imbalanced datasets, and the lack of robust AI models trained with rigorous group-aware validation.',
      objective: 'To develop a unified, quality-controlled AFI research pipeline integrating frequency-aware denoising, class-conditional synthetic augmentation, automated synthetic-image selection, leakage-aware classification, and independent risk screening for non-invasive oral cancer detection. The system translates from benchtop confocal microscopy to a portable LED-based microscope for clinical deployment.',
      methodology: 'Exfoliated buccal cells from non-smoker (normal), susceptible (tobacco smokers >4 cigarettes/day for >5 years), and histologically confirmed oral cancer cohorts were imaged without exogenous labels using a Leica STELLARIS 5 laser scanning confocal microscope at 405/488/638 nm excitation, registered as pseudo-RGB composites, and cropped to 256×256 single-cell ROIs.  Pipeline stages: (1) FASCANet frequency-aware denoising — db2 wavelet decomposition, dual residual frequency branches, Spatial Cross-Attention, inverse wavelet reconstruction — trained under Noisier2Noise protocol without clean references. (2) Class-conditional StyleGAN2-ADA synthetic augmentation with Neural Texture Preserving (NTP) loss — reducing FID by 8.70–9.60% and KID by 20.45–25.74%. (3) Automated quality-control pipeline screening 2,000 generated candidates down to 215 retained images using DINOv2/CLIP similarity, LPIPS, class-margin, and memorisation filters. (4) CAFNet-Hybrid dual-branch classifier — ConvNeXt V2-Nano for local texture + SwinV2-Tiny for global context, fused via cross-attention. (5) ROI-grouped 5-fold cross-validation with independent Stage 3 screening cohort.  Hardware: Custom-built portable LED autofluorescence microscope on Raspberry Pi 5 with 405/488/638 nm LED excitation, integrated cell-segmentation and on-edge screening pipeline (OncoSpectrix platform).',
      key_contributions: '1. FASCANet: First noise-supervised wavelet-domain denoising network for label-free AFI. db2 decomposition with Spatial Cross-Attention enabling bidirectional frequency-band information exchange. PSNR 38.79 ± 2.30 dB, SSIM 0.90 ± 0.04 without clean references.  2. Texture-preserving StyleGAN2-ADA with Neural Texture Preservation (NTP) loss and automated quality-control pipeline. 2,000 generated → 215 retained. KID reduced 20.45–25.74%, FID reduced 8.70–9.60% while maintaining diversity.  3. CAFNet-Hybrid: ConvNeXt V2-Nano + SwinV2-Tiny dual-branch classifier with Feature Pyramid Network, Generalized Mean pooling, and cross-attention fusion. Macro F1 = 0.879 ± 0.035, AUC = 0.948 ± 0.029, MCC = 0.769 ± 0.064 under ROI-grouped 5-fold cross-validation.  4. Independent screening on unseen cohort demonstrating ordered normal→smoker→cancer probability continuum (Spearman ρ = 0.857, p < 10⁻¹²), with smokers showing greatest out-of-distribution novelty — evidence of a feature-space continuum, not a smoker diagnosis.  5. OncoSpectrix: Translation of benchtop confocal pipeline to portable LED-based microscope on Raspberry Pi 5 with on-edge AI inference.  6. Grad-CAM++ interpretability localising model evidence to nuclear and perinuclear regions.',
      results: 'Denoising: PSNR 38.79 ± 2.30 dB, SSIM 0.90 ± 0.04 under mixed Poisson-Gaussian noise. Downstream 3-class EfficientNet-B0: cancer precision 0.86 → 0.96, specificity 0.94 → 0.98 after denoising.  Synthetic augmentation: StyleGAN2-ADA + NTP loss achieved FID 73.51 (vs 80.52 baseline) for cancer, KID 0.0297 (vs 0.0374) for cancer. Quality pipeline retained 215 of 2,000 candidates.  Classification (ROI-grouped 5-fold): CAFNet-Hybrid macro F1 = 0.879 ± 0.035, AUC = 0.948 ± 0.029, cancer precision 0.96, specificity 0.98. Cancer sensitivity 0.862.  Independent screening: Ordered normal→smoker→cancer probability trend confirmed (Spearman ρ = 0.857). Smoker images showed greatest OOD novelty, consistent with intermediate AFI phenotype.  Dataset: 608 development images (348 normal, 260 cancer) + 43 independent screening images (14 normal, 18 smoker, 11 cancer).',
      conclusions: 'Synthetic augmentation is most useful when generated images are rigorously screened and performance is evaluated with group-aware splits. The proposed system is intended as a triage framework, not a replacement for biopsy or histopathology. The independent screening result describes an ordered feature-space continuum and not a smoker diagnosis.',
      future_work: 'Prospective, patient-level, multisite clinical validation. Extension to additional cancer types and imaging modalities. NVIDIA Jetson AGX Orin for on-edge model training. Collection of larger datasets from different study groups through the developed microscope. Conversion of lab prototype to market-ready product with IEC clinical approvals.',
      sort_order: 1,
    },
    {
      title: 'Differentiating Cannabis-Consuming Population from Non-Consumers using ECG Morphological Features through Machine Learning Models',
      degree: 'Bachelor of Technology (B.Tech)',
      institution: 'Department of Biotechnology & Medical Engineering, National Institute of Technology (NIT), Rourkela',
      supervisor: 'Dr. J. Sivaraman',
      year: '2023–2024',
      research_problem: 'Non-invasive detection of cannabis consumption through cardiac electrophysiology. Current methods rely on invasive blood/urine tests with limited detection windows. Cannabis use affects cardiac electrophysiology through alterations in autonomic nervous system regulation, and morphological features in ECG signals may carry discriminative information for identifying cannabis consumers.',
      objective: 'To develop and benchmark machine learning classifiers for differentiating cannabis consumers from non-consumers using ECG morphological features extracted from standard ECG recordings. To identify statistically validated biomarkers for non-invasive cannabis screening.',
      methodology: '200-subject cohort (100 normal, 100 cannabis-consuming). Complete MATLAB ECG processing pipeline: (1) Bandpass filtering for noise removal. (2) Notch filtering for powerline interference. (3) db4 wavelet baseline-wander removal. (4) Pan-Tompkins QRS detection and P/QRS/T wave delineation. (5) Morphological feature extraction: RR interval, QRS duration/amplitude, P-wave duration/amplitude, T-wave duration/amplitude. (6) Statistical validation via Mann-Whitney U testing. (7) Benchmarking of 9 ML classifiers: Gradient Boosting, XGBoost, Random Forest, SVM, KNN, Naive Bayes, Logistic Regression, Decision Tree, RNN-LSTM.',
      key_contributions: '1. First ML-based ECG morphological approach for cannabis consumption detection. 2. Statistically validated group separation with Mann-Whitney U testing (p < 0.001 for R-wave amplitude, RR interval, QRS duration, P-wave and T-wave amplitude). 3. Gradient Boosting identified as top performer (92% accuracy, AUC 0.98). 4. 6-fold cross-validation: 89% accuracy demonstrating generalisability. 5. Comprehensive benchmarking of 9 classifiers establishing a baseline for future work.',
      results: 'Gradient Boosting: 92% accuracy, AUC 0.98 (best performer). XGBoost: 90% accuracy. Random Forest: 90% accuracy. RNN(LSTM): 87% accuracy. Mann-Whitney U testing: p < 0.001 for R-wave amplitude, RR interval, QRS duration, P-wave and T-wave amplitude — confirming statistically significant group separation. 6-fold cross-validation: 89% accuracy.',
      conclusions: 'ECG morphological features carry discriminative information for cannabis consumption detection. Gradient Boosting provides the best classification performance, suggesting that tree-based ensemble methods are well-suited for this type of structured physiological feature space.',
      future_work: 'Larger cohort validation with diverse populations. Real-time deployment for point-of-care screening. Longitudinal monitoring to track cannabis cessation effects on ECG morphology. Extension to other substance detection via cardiac electrophysiology.',
      pdf_url: null,
      sort_order: 2,
    },
  ];

  const thesisStmt = db.prepare('INSERT INTO theses (title, degree, institution, supervisor, year, research_problem, objective, methodology, key_contributions, results, conclusions, future_work, pdf_url, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  for (const t of theses) thesisStmt.run(t.title, t.degree, t.institution, t.supervisor, t.year, t.research_problem, t.objective, t.methodology, t.key_contributions, t.results, t.conclusions, t.future_work, t.pdf_url, t.sort_order);
  console.log('✅ Theses created');

  // --- Timeline ---
  const timeline = [
    { title: 'B.Tech Biomedical Engineering', description: 'Started B.Tech at NIT Rourkela, Department of Biotechnology & Medical Engineering.', date: '2018', category: 'education', icon: '🎓', sort_order: 1 },
    { title: 'B.Tech Thesis: ECG Cannabis Detection', description: 'Completed undergraduate research on differentiating cannabis consumers from non-consumers using ECG morphological features and ML classifiers. Supervisor: Dr. J. Sivaraman.', date: '2022', category: 'research', icon: '📊', sort_order: 2 },
    { title: 'B.Tech Graduation', description: 'Graduated from NIT Rourkela with B.Tech in Biomedical Engineering, CGPA 8.55/10.0.', date: '2022', category: 'education', icon: '🎓', sort_order: 3 },
    { title: 'M.Tech Biomedical Engineering', description: 'Joined IIEST Shibpur, Centre for Healthcare Science and Technology. Supervisor: Dr. Ananya Barui.', date: '2024', category: 'education', icon: '🎓', sort_order: 4 },
    { title: 'Microgravity Platform Development', description: 'Designed and built the automated multi-modal microgravity-on-a-chip simulation platform with dual NEMA 14 stepper motors, Raspberry Pi 3 controller, and IoT mobile app.', date: '2025', category: 'project', icon: '🛰️', sort_order: 5 },
    { title: 'Patent Filed: Microgravity Platform', description: 'Patent application filed at IIEST Shibpur. PIC novelty search report obtained. Inventors: A. Sarkar, S.R.V. Vardhan, Dr. A. Barui.', date: '2025', category: 'patent', icon: '📄', sort_order: 6 },
    { title: 'OncoSpectrix Hardware Prototype', description: 'Built portable LED autofluorescence microscope on Raspberry Pi 5 with integrated cell-segmentation and on-edge screening pipeline.', date: '2025', category: 'project', icon: '🔬', sort_order: 7 },
    { title: 'FASCANet Denoising Network', description: 'Designed frequency-aware spatial cross-attention denoising network for label-free AFI. Achieved PSNR 38.79 ± 2.30 dB without clean references.', date: '2025', category: 'research', icon: '🧠', sort_order: 8 },
    { title: 'StyleGAN2 Synthetic Augmentation', description: 'Developed texture-preserving StyleGAN2-ADA with automated QC pipeline. 2,000 generated → 215 retained for augmentation.', date: '2025', category: 'research', icon: '🎨', sort_order: 9 },
    { title: 'AFiS-Net Classifier', description: 'Built ConvNeXt V2 + SwinV2 dual-branch classifier. Macro F1 = 0.879, AUC = 0.948 under ROI-grouped 5-fold cross-validation.', date: '2026', category: 'research', icon: '🧠', sort_order: 10 },
    { title: 'FASCANet Manuscript Submitted to IEEE JBHI', description: 'Manuscript submitted to IEEE Journal of Biomedical and Health Informatics. Under review.', date: '2026', category: 'publication', icon: '📝', sort_order: 11 },
    { title: 'Synthetic Augmentation Manuscript Submitted to CBM', description: 'Manuscript submitted to Computers in Biology and Medicine (Elsevier). Under review.', date: '2026', category: 'publication', icon: '📝', sort_order: 12 },
    { title: 'Patent Filed: AFI Device & AI Screening', description: 'Patent application for OncoSpectrix hardware + AI diagnostic platform, filed with IIEST Shibpur and AI4ICPS I-Hub Foundation (IIT Kharagpur).', date: '2026', category: 'patent', icon: '📄', sort_order: 13 },
    { title: 'OncoSpectrix MedTech Startup Incubated', description: 'Startup incubated at TCGTBI, IIEST Shibpur. Integrating OncoSpectrix hardware, AI stack, IEC clinical approvals, and patent filing. Multiple BIRAC grant proposals authored.', date: '2026', category: 'startup', icon: '🚀', sort_order: 14 },
    { title: 'M.Tech Graduation — University Gold Medallist', description: 'Graduated with M.Tech in Biomedical Engineering, CGPA 10/10. University Gold Medallist.', date: '2026', category: 'award', icon: '🏆', sort_order: 15 },
  ];

  const timeStmt = db.prepare('INSERT INTO timeline (title, description, date, category, icon, sort_order) VALUES (?, ?, ?, ?, ?, ?)');
  for (const t of timeline) timeStmt.run(t.title, t.description, t.date, t.category, t.icon, t.sort_order);
  console.log('✅ Timeline created');

  // --- Research Notes (Blog) ---
  const admin = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail) as { id: number };

  const posts = [
    {
      title: 'Understanding Autofluorescence Imaging for Cancer Screening',
      slug: 'understanding-afi-cancer-screening',
      content: '<h2>What is Autofluorescence Imaging?</h2><p>Autofluorescence imaging (AFI) is a label-free optical technique that detects cellular abnormalities through the endogenous autofluorescence of cells, which reflects their metabolic status. Endogenous fluorophores such as NAD(P)H and FAD participate in cellular respiration and produce measurable intensity differences that distinguish healthy from malignant conditions.</p><h2>Why It Matters for Oral Cancer</h2><p>Oral cancer is often diagnosed at an advanced stage. AFI offers a non-invasive alternative to biopsy by capturing metabolic changes that occur before obvious morphological abnormalities appear. This makes it a promising screening tool for early detection.</p><h2>Our Approach</h2><p>We developed a complete pipeline from confocal acquisition through denoising, synthetic augmentation, and AI-based classification — all without exogenous labels or contrast agents.</p>',
      excerpt: 'An introduction to label-free autofluorescence imaging and its potential for non-invasive oral cancer screening.',
      published: 1,
      category: 'research_notes',
    },
    {
      title: 'Frequency-Aware Denoising: Why Wavelets Matter for Medical Imaging',
      slug: 'frequency-aware-denoising-wavelets',
      content: '<h2>The Problem</h2><p>Medical imaging data — especially in fluorescence microscopy — suffers from noise that occupies different frequency bands than the signal of interest. Traditional denoising methods treat all frequencies equally, often destroying the fine textures that carry diagnostic information.</p><h2>Wavelet Decomposition</h2><p>By decomposing images using a discrete wavelet transform (db2), we can separate low-frequency background from high-frequency detail and apply targeted corrections to each band independently.</p><h2>Spatial Cross-Attention</h2><p>The key innovation in FASCANet is coupling these frequency branches through a Spatial Cross-Attention module, enabling bidirectional information exchange without losing spectral specialization.</p>',
      excerpt: 'How FASCANet uses db2 wavelet decomposition and spatial cross-attention to denoise autofluorescence images while preserving metabolic texture.',
      published: 1,
      category: 'research_notes',
    },
    {
      title: 'Building a Portable Autofluorescence Microscope on Raspberry Pi',
      slug: 'portable-afi-microscope-rpi',
      content: '<h2>From Benchtop to Bedside</h2><p>Translating a confocal AFI pipeline from a Leica STELLARIS 5 to a portable LED-based microscope on Raspberry Pi 5 required rethinking every stage: illumination, detection, segmentation, and inference.</p><h2>Design Choices</h2><p>LED excitation at 405/488/638 nm replaces laser illumination. The Raspberry Pi 5 provides sufficient compute for watershed-based cell segmentation and on-edge deep-learning inference. The entire pipeline runs locally without cloud connectivity.</p><h2>Edge AI</h2><p>Denoising and preliminary screening run entirely on the Raspberry Pi, making the system deployable in resource-constrained clinical environments.</p>',
      excerpt: 'Design decisions and engineering trade-offs in building a portable label-free autofluorescence microscope for point-of-care screening.',
      published: 1,
      category: 'research_notes',
    },
  ];

  const postStmt = db.prepare('INSERT INTO posts (title, slug, content, excerpt, published, author_id, category, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime(\'now\'))');
  for (const p of posts) postStmt.run(p.title, p.slug, p.content, p.excerpt, p.published, admin.id, p.category);
  console.log('✅ Research notes created');

  // --- Project Media ---
  // Get project IDs
  const oralCancerId = (db.prepare('SELECT id FROM projects WHERE slug = ?').get('oral-cancer-afi') as any).id;
  const fascanetId = (db.prepare('SELECT id FROM projects WHERE slug = ?').get('fascanet-denoising') as any).id;
  const microgravityId = (db.prepare('SELECT id FROM projects WHERE slug = ?').get('microgravity-platform') as any).id;
  const microscopeId = (db.prepare('SELECT id FROM projects WHERE slug = ?').get('oncospectrix-microscope') as any).id;
  const coalId = (db.prepare('SELECT id FROM projects WHERE slug = ?').get('coal-volume-estimation') as any).id;
  const ecgId = (db.prepare('SELECT id FROM projects WHERE slug = ?').get('ecg-cannabis-detection') as any).id;

  const mediaStmt = db.prepare('INSERT INTO project_media (project_id, file_path, media_type, caption, section, sort_order) VALUES (?, ?, ?, ?, ?, ?)');

  // Oral Cancer AFI - pipeline figures
  mediaStmt.run(oralCancerId, '/research/oral-cancer/fig6_workflow_overview.png', 'image', 'Complete research pipeline: confocal AFI acquisition through denoising, synthetic augmentation, classification, and independent screening.', 'methodology', 1);
  mediaStmt.run(oralCancerId, '/research/oral-cancer/model.png', 'image', 'AFiS-Net architecture: ConvNeXt V2 + SwinV2 Transformer dual-branch classifier with cross-attention fusion.', 'computational_method', 2);
  mediaStmt.run(oralCancerId, '/research/oral-cancer/fig5b_screening_progression.png', 'image', 'Ordered normal → smoker → cancer probability continuum from independent risk screening (Spearman ρ = 0.857).', 'results', 3);
  mediaStmt.run(oralCancerId, '/research/oral-cancer/noiseanalysis.png', 'image', 'Noise analysis across spectral channels under mixed Poisson-Gaussian conditions.', 'experimental_setup', 4);
  mediaStmt.run(oralCancerId, '/research/oral-cancer/rawcolorrep.png', 'image', 'Raw pseudo-RGB color representation of confocal AFI at 405/488/638 nm excitation.', 'data_acquisition', 5);
  mediaStmt.run(oralCancerId, '/research/oral-cancer/redoox.png', 'image', 'NADH/FAD redox-ratio analysis showing preserved metabolic ordering after denoising.', 'results', 6);
  mediaStmt.run(oralCancerId, '/research/oral-cancer/greenimsgingsoft.png', 'image', 'Green-channel imaging software interface for AFI acquisition.', 'experimental_setup', 7);
  mediaStmt.run(oralCancerId, '/research/oral-cancer/segmentingsoft.png', 'image', 'Cell segmentation software interface for single-cell ROI extraction.', 'data_acquisition', 8);

  // FASCANet - denoising figures
  mediaStmt.run(fascanetId, '/research/oral-cancer/model.png', 'image', 'FASCANet dual-branch architecture with db2 wavelet decomposition and Spatial Cross-Attention.', 'computational_method', 1);
  mediaStmt.run(fascanetId, '/research/oral-cancer/noiseanalysis.png', 'image', 'Noise characterization across AFI spectral channels.', 'experimental_setup', 2);
  mediaStmt.run(fascanetId, '/research/oral-cancer/rawcolorrep.png', 'image', 'Input AFI images with visible photon-dependent noise.', 'data_acquisition', 3);
  mediaStmt.run(fascanetId, '/research/oral-cancer/redoox.png', 'image', 'Preserved NADH/FAD redox ratio after FASCANet denoising.', 'results', 4);

  // Microgravity Platform
  mediaStmt.run(microgravityId, '/research/microgravity/WhatsApp Image 2026-05-15 at 10.04.52.jpeg', 'image', 'Microgravity simulation platform — dual-axis gimbal with NEMA 14 stepper motors and Raspberry Pi controller.', 'hardware', 1);
  mediaStmt.run(microgravityId, '/research/microgravity/WhatsApp Video 2026-05-16 at 16.51.39.mp4', 'video', 'Platform operating in 3D clinostat mode with real-time Gavg computation.', 'experimental_setup', 2);
  mediaStmt.run(microgravityId, '/research/microgravity/WhatsApp Video 2026-08-21 at 13.58.28.mp4', 'video', 'Hybrid Clinostat–RPM mode demonstration with IoT mobile app control.', 'experimental_setup', 3);
  mediaStmt.run(microgravityId, '/research/microgravity/WhatsApp Video 2026-08-21 at 13.58.34.mp4', 'video', 'Live camera telemetry feed during microgravity simulation.', 'experimental_setup', 4);

  // OncoSpectrix Microscope — Hardware
  mediaStmt.run(microscopeId, '/research/microscope/20260702_11h59m25s_grim.png', 'image', 'Portable LED autofluorescence microscope — custom-built enclosure with 405/488/638 nm LED excitation sources.', 'hardware', 1);
  mediaStmt.run(microscopeId, '/research/microscope/20260702_12h02m03s_grim.png', 'image', 'Microscope LED illumination module and camera assembly showing multi-wavelength excitation configuration.', 'hardware', 2);
  mediaStmt.run(microscopeId, '/research/microscope/20260702_12h53m03s_grim.png', 'image', 'Integrated microscope system with Raspberry Pi 5 controller and complete optical assembly.', 'hardware', 3);
  mediaStmt.run(microscopeId, '/research/microscope/WhatsApp Image 2026-08-21 at 13.58.09.jpeg', 'image', 'Microscope prototype — full system view with LED illumination and optics enclosure.', 'hardware', 4);
  mediaStmt.run(microscopeId, '/research/microscope/WhatsApp Image 2026-08-21 at 13.58.09 (1).jpeg', 'image', 'Microscope prototype — close-up of optical assembly and LED excitation module.', 'hardware', 5);

  // OncoSpectrix Microscope — PPT content: LED excitation table
  mediaStmt.run(microscopeId, '/research/microscope/Screenshot 2026-08-21 170928.png', 'image', 'LED excitation wavelengths and corresponding metabolite emissions: 405 nm → NAD(P)H (440–460 nm), 465 nm → FAD/flavins (510–540 nm), 520 nm → Lipofuscin (600–700 nm). Cellular autofluorescence imaging captures metabolic signatures.', 'methodology', 10);

  // PPT: Literature review — oral cancer statistics
  mediaStmt.run(microscopeId, '/research/microscope/Screenshot 2026-08-21 170945.png', 'image', 'Oral cancer statistics and motivation: 60–80% diagnosed at Stage III/IV in India; need for affordable rapid screening at primary care level using label-free non-invasive autofluorescence imaging.', 'research_problem', 11);

  // PPT: Sample collection and imaging workflow
  mediaStmt.run(microscopeId, '/research/microscope/Screenshot 2026-08-21 171003.png', 'image', 'Schematic representation of sample collection and imaging workflow: (A) Collecting oral cells using cotton swab. (B) Mixing cells in inoculum with PBS. (C) Centrifuge. (D) Smear preparation. (E) Imaging under multispectral microscope. (F) Multi-excitation autofluorescent images.', 'experimental_setup', 12);

  // PPT: AFI images of oral cells
  mediaStmt.run(microscopeId, '/research/microscope/Screenshot 2026-08-21 171027.png', 'image', 'Autofluorescent images of oral cells: (A) Excited at 405 nm (blue channel), (B) 488 nm (green), (C) 550 nm (red), (D) Pseudo-RGB composite with 256×256 ROI cropping. Complete single-cell oral AFI dataset with 3 channels for all study groups.', 'data_acquisition', 13);

  // PPT: FASCANet architecture diagram
  mediaStmt.run(microscopeId, '/research/microscope/Screenshot 2026-08-21 171103.png', 'image', 'FASCANet denoising model architecture: db2 wavelet decomposition into LL (coarse structure/edges) and HL/LH/HH (texture/fine details/noise) subbands. Residual network with alternating 6 residual blocks and Spatial Cross-Attention. Bidirectional frequency-band information exchange preserves relevant texture while removing noise.', 'computational_method', 14);

  // PPT: Denoising comparison
  mediaStmt.run(microscopeId, '/research/microscope/Screenshot 2026-08-21 171118.png', 'image', 'FASCANet denoising results: Raw autofluorescence input, corrupted versions under three noise models, FASCANet-denoised outputs, and residual noise maps. FASCANet preserves high-frequency details of AFI while removing noise. Trained using Noisier2Noise protocol with L1 loss.', 'results', 15);

  // PPT: Denoising performance table
  mediaStmt.run(microscopeId, '/research/microscope/Screenshot 2026-08-21 171153.png', 'image', 'Table 1: Image quality metrics for denoising models under mixed Poisson-Gaussian noise (λ=30, σ=0.02). FASCANet: PSNR 37.15 dB, SSIM 0.84, VIF 0.39. Table 2: 3-class classification performance — raw vs FASCANet-denoised AFI: cancer precision improved 0.86→0.96, specificity 0.94→0.98.', 'results', 16);

  // PPT: Redox ratio preservation
  mediaStmt.run(microscopeId, '/research/microscope/Screenshot 2026-08-21 171214.png', 'image', 'Optical redox ratio FAD/(NADH+FAD) before and after FASCANet denoising. Normal-suspicious-cancer ordering is preserved. FASCANet effectively suppresses noise while preserving subtle autofluorescence textures and biologically meaningful fluorescence characteristics.', 'results', 17);

  // Existing screenshots — on-edge pipeline
  mediaStmt.run(microscopeId, '/research/microscope/Screenshot_2026-08-08_133944.png', 'image', 'On-edge cell segmentation pipeline output — brightfield reference image with watershed-based cell boundary detection.', 'computational_method', 20);
  mediaStmt.run(microscopeId, '/research/microscope/Screenshot_2026-08-08_134716.png', 'image', 'On-edge autofluorescence image processing pipeline output — segmented cells with fluorescence intensity analysis.', 'computational_method', 21);
  mediaStmt.run(microscopeId, '/research/microscope/WhatsApp Video 2026-08-21 at 13.58.22.mp4', 'video', 'OncoSpectrix prototype demonstration — complete acquisition and on-edge screening pipeline in operation.', 'experimental_setup', 22);

  // Raspberry Pi edge processing images
  mediaStmt.run(microscopeId, '/research/microscope/raspi/blue capturing.png', 'image', 'Raspberry Pi software: Blue channel (405 nm) autofluorescence image capture interface showing LED excitation control and camera settings.', 'data_acquisition', 30);
  mediaStmt.run(microscopeId, '/research/microscope/raspi/green capturing.png', 'image', 'Raspberry Pi software: Green channel (488 nm) autofluorescence image capture interface for multi-wavelength acquisition.', 'data_acquisition', 31);
  mediaStmt.run(microscopeId, '/research/microscope/raspi/red ccacpturing.png', 'image', 'Raspberry Pi software: Red channel (638 nm) autofluorescence image capture interface completing the three-channel acquisition.', 'data_acquisition', 32);
  mediaStmt.run(microscopeId, '/research/microscope/raspi/ommon ROI capturing for all colors .png', 'image', 'Raspberry Pi software: Common ROI capturing interface — unified region-of-interest selection across all three spectral channels.', 'data_acquisition', 33);
  mediaStmt.run(microscopeId, '/research/microscope/raspi/live roi capturing.png', 'image', 'Raspberry Pi software: Live ROI capturing mode for real-time single-cell region-of-interest extraction from camera feed.', 'data_acquisition', 34);
  mediaStmt.run(microscopeId, '/research/microscope/raspi/breightfeild iamging.png', 'image', 'Raspberry Pi software: Brightfield imaging module for cell segmentation reference — provides morphological context for fluorescence analysis.', 'experimental_setup', 35);
  mediaStmt.run(microscopeId, '/research/microscope/raspi/segmentaion on edge.png', 'image', 'Raspberry Pi software: On-edge cell segmentation pipeline — watershed-based boundary detection running locally on Raspberry Pi 5.', 'computational_method', 36);
  mediaStmt.run(microscopeId, '/research/microscope/raspi/denosing.png', 'image', 'Raspberry Pi software: On-edge FASCANet denoising inference — noise reduction while preserving autofluorescence textures.', 'computational_method', 37);
  mediaStmt.run(microscopeId, '/research/microscope/raspi/denosing on edge wiht modl inference.png', 'image', 'Raspberry Pi software: On-edge denoising with full model inference pipeline — demonstrating complete local processing without cloud dependency.', 'computational_method', 38);
  mediaStmt.run(microscopeId, '/research/microscope/raspi/settings and features avialable for image acqasition.png', 'image', 'Raspberry Pi software: Settings and configuration panel for image acquisition — exposure, gain, LED intensity, and spectral channel selection.', 'experimental_setup', 39);
  mediaStmt.run(microscopeId, '/research/microscope/raspi/noraml cell.png', 'image', 'Raspberry Pi software: Classification output — normal cell detection result showing cancer probability scoring from CAFNet-Hybrid model.', 'results', 40);
  mediaStmt.run(microscopeId, '/research/microscope/raspi/cancer cell.png', 'image', 'Raspberry Pi software: Classification output — cancer cell detection result showing elevated cancer probability from on-edge AI screening.', 'results', 41);
  mediaStmt.run(microscopeId, '/research/microscope/raspi/smoker cell.png', 'image', 'Raspberry Pi software: Classification output — smoker cell detection result showing intermediate risk profile in the ordered probability continuum.', 'results', 42);

  // Coal Volume Estimation
  mediaStmt.run(coalId, '/research/coal-volume/scan_map.png', 'image', 'ROS 2 sensor-fusion scan map — YOLO-segmented coal occupancy with LiDAR depth profiling.', 'computational_method', 1);
  mediaStmt.run(coalId, '/research/coal-volume/session_20260801_220024.png', 'image', 'Conveyor belt scanning session — real-time volumetric and mass flow-rate measurement.', 'experimental_setup', 2);
  mediaStmt.run(coalId, '/research/coal-volume/WhatsApp Image 2026-08-21 at 13.58.34.jpeg', 'image', 'Industrial conveyor system with PiCamera2 and RPLIDAR sensor mounted above belt.', 'hardware', 3);

  // ECG Cannabis Detection
  mediaStmt.run(ecgId, '/research/ecg-cannabis-detection/corer.png', 'image', 'ECG signal processing pipeline — bandpass and notch filtering with db4 wavelet baseline-wander removal for morphological feature extraction.', 'methodology', 1);
  mediaStmt.run(ecgId, '/research/ecg-cannabis-detection/download.png', 'image', 'Pan-Tompkins QRS detection and P/QRS/T wave delineation on sample ECG recordings.', 'methodology', 2);
  mediaStmt.run(ecgId, '/research/ecg-cannabis-detection/feature-extraction.png', 'image', 'Morphological feature extraction — RR interval, QRS duration/amplitude, P-wave and T-wave parameters from delineated ECG signals.', 'experimental_setup', 3);
  mediaStmt.run(ecgId, '/research/ecg-cannabis-detection/classifier-results.png', 'image', 'ML classifier performance comparison — Gradient Boosting achieves 92% accuracy with AUC 0.98 for cannabis consumption detection.', 'results', 4);

  console.log('✅ Project media created');
  console.log('🎉 Database seeded successfully with research data!');
  db.close();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
