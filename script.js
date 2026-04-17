/**
 * Romana Akhtar Portfolio - script.js
 * Vanilla JavaScript for interactivity
 */

import { GoogleGenAI, Modality } from "@google/genai";

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // AI Voiceover Logic
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const playBtn = document.getElementById('play-sample');
    const playerText = document.getElementById('player-text');
    const playIcon = document.getElementById('play-icon');
    const audioProgress = document.getElementById('audio-progress');
    const audioTime = document.getElementById('audio-time');
    const audioCard = document.querySelector('.audio-card');
    
    let audioContext = null;
    let audioBuffer = null;
    let sourceNode = null;
    let startTime = 0;
    let isPlaying = false;
    let progressInterval = null;

    async function generateAudio() {
        const script = `
            Assalam o Alaikum,
            My name is Romana.
            I create professional AI voiceovers, podcast style audio, and automated content scripts that are clear, engaging, and high quality.
            If you are looking for voiceovers for your YouTube videos, Islamic storytelling, podcasts, or business content — I can convert your script into a smooth and professional voice.
            My goal is to make your content sound natural, powerful, and audience-friendly.
            You can also contact me if you want custom scripts or full audio production services.
            Thank you for your time.
            ...and in a soft whisper tone:
            You can also get your own professional voice like this... just send me your script, and I will convert it into a clean, high-quality voiceover for you.
        `;

        try {
            const response = await ai.models.generateContent({
                model: "gemini-3.1-flash-tts-preview",
                contents: [{ parts: [{ text: `Say in a soft, calm, confident, professional female tone: ${script}` }] }],
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: { voiceName: 'Kore' },
                        },
                    },
                },
            });

            const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
                return base64Audio;
            }
            throw new Error('No audio data received');
        } catch (error) {
            console.error('Error generating audio:', error);
            return null;
        }
    }

    async function playAudio(base64Data) {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
        }

        const binaryString = atob(base64Data);
        const len = binaryString.length / 2;
        const bytes = new Int16Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i * 2) | (binaryString.charCodeAt(i * 2 + 1) << 8);
        }

        const float32Data = new Float32Array(len);
        for (let i = 0; i < len; i++) {
            float32Data[i] = bytes[i] / 32768; // Normalize to [-1, 1]
        }

        audioBuffer = audioContext.createBuffer(1, len, 24000);
        audioBuffer.getChannelData(0).set(float32Data);

        sourceNode = audioContext.createBufferSource();
        sourceNode.buffer = audioBuffer;
        sourceNode.connect(audioContext.destination);
        
        sourceNode.onended = () => {
            stopPlayback();
        };

        startTime = audioContext.currentTime;
        sourceNode.start(0);
        startProgress();
    }

    function startProgress() {
        isPlaying = true;
        audioCard.classList.add('playing');
        playerText.textContent = 'Playing...';
        playIcon.setAttribute('data-lucide', 'square');
        lucide.createIcons();

        progressInterval = setInterval(() => {
            if (!audioBuffer) return;
            const elapsed = audioContext.currentTime - startTime;
            const duration = audioBuffer.duration;
            const progress = (elapsed / duration) * 100;
            
            audioProgress.style.width = `${Math.min(progress, 100)}%`;
            
            const minutes = Math.floor(elapsed / 60);
            const seconds = Math.floor(elapsed % 60);
            audioTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            if (elapsed >= duration) {
                stopPlayback();
            }
        }, 100);
    }

    function stopPlayback() {
        if (sourceNode) {
            try { sourceNode.stop(); } catch(e) {}
            sourceNode = null;
        }
        clearInterval(progressInterval);
        isPlaying = false;
        audioCard.classList.remove('playing');
        playerText.textContent = 'Play Sample';
        playIcon.setAttribute('data-lucide', 'play');
        lucide.createIcons();
        audioProgress.style.width = '0%';
        audioTime.textContent = '0:00';
    }

    if (playBtn) {
        playBtn.addEventListener('click', async () => {
            if (isPlaying) {
                stopPlayback();
                return;
            }

            playerText.textContent = 'Generating...';
            const base64 = await generateAudio();
            if (base64) {
                playAudio(base64);
            } else {
                playerText.textContent = 'Error';
                setTimeout(() => playerText.textContent = 'Play Sample', 2000);
            }
        });
    }

    // Scroll Animations using Intersection Observer
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Custom Cursor
    const cursor = document.getElementById('cursor');
    const cursorBlur = document.getElementById('cursor-blur');

    document.addEventListener('mousemove', (e) => {
        const x = e.clientX;
        const y = e.clientY;

        cursor.style.transform = `translate(${x}px, ${y}px)`;
        cursorBlur.style.transform = `translate(${x}px, ${y}px)`;
    });

    // Projects Data
    const projects = [
        {
            id: 1,
            title: "Enterprise CRM Sync",
            category: "automation",
            image: "https://picsum.photos/seed/automation1/800/600",
            tags: ["Google Apps Script", "Salesforce API"],
            description: "A robust automation engine that synchronizes multi-departmental data between Google Sheets and Salesforce in real-time. This solution reduced manual data entry by 85% and eliminated synchronization errors across the organization.",
            link: "#"
        },
        {
            id: 2,
            title: "Financial Dashboard",
            category: "dashboards",
            image: "https://picsum.photos/seed/dashboard1/800/600",
            tags: ["Web Apps", "Data Visualization"],
            description: "Custom-built financial monitoring system for a logistics firm. It features real-time cost tracking, automated profit margin calculations, and interactive visualizations built with Apps Script and high-performance charting libraries.",
            link: "#"
        },
        {
            id: 3,
            title: "AI Content Architect",
            category: "automation",
            image: "https://picsum.photos/seed/ai2/800/600",
            tags: ["AI Solutions", "Natural Language Processing"],
            description: "An intelligent content generation platform that leverages large language models to automate marketing copy, blog posts, and social media updates directly within Google Workspace. Integrated with custom workflows for approval and direct publishing.",
            link: "#"
        },
        {
            id: 4,
            title: "Inventory Master Pro",
            category: "web-apps",
            image: "https://picsum.photos/seed/inventory1/800/600",
            tags: ["Web Apps", "Database Design"],
            description: "A comprehensive warehouse management web application. It handles QR code scanning, multi-location stock tracking, and automated reorder alerts. Built as a server-side web app served through Google Apps Script.",
            link: "#"
        }
    ];

    const projectsGrid = document.getElementById('projects-grid');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const modal = document.getElementById('project-modal');
    const modalClose = document.querySelector('.modal-close');
    const modalBackdrop = document.querySelector('.modal-backdrop');

    // Render Projects
    function renderProjects(category = 'all') {
        if (!projectsGrid) return;
        
        projectsGrid.innerHTML = '';
        const filtered = category === 'all' ? projects : projects.filter(p => p.category === category);

        filtered.forEach(project => {
            const card = document.createElement('div');
            card.className = 'project-card';
            card.innerHTML = `
                <div class="project-image">
                    <img src="${project.image}" alt="${project.title}" referrerPolicy="no-referrer">
                </div>
                <div class="project-info">
                    <h3>${project.title}</h3>
                    <p>${project.description.substring(0, 100)}...</p>
                    <div class="project-tags">
                        ${project.tags.map(tag => `<span>${tag}</span>`).join('')}
                    </div>
                </div>
            `;
            card.addEventListener('click', () => openModal(project));
            projectsGrid.appendChild(card);
        });

        // Re-observe new elements
        const newCards = projectsGrid.querySelectorAll('.project-card');
        newCards.forEach(card => observer.observe(card));
    }

    // Modal Logic
    function openModal(project) {
        document.getElementById('modal-img').src = project.image;
        document.getElementById('modal-title').textContent = project.title;
        document.getElementById('modal-description').textContent = project.description;
        document.getElementById('modal-link').href = project.link;
        
        const tagsContainer = document.getElementById('modal-tags');
        tagsContainer.innerHTML = project.tags.map(tag => `<span>${tag}</span>`).join('');
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

    // Filter Logic
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderProjects(btn.dataset.filter);
        });
    });

    // Initial Render
    renderProjects();

    // Elements to animate
    const animateElements = [
        ...document.querySelectorAll('section h2'),
        ...document.querySelectorAll('.project-card'),
        ...document.querySelectorAll('.stat-card'),
        ...document.querySelectorAll('.initiative-item'),
        ...document.querySelectorAll('.skill-category'),
        ...document.querySelectorAll('.impact-card'),
        ...document.querySelectorAll('.contact-wrapper')
    ];

    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.8s cubic-bezier(0.23, 1, 0.32, 1)';
        observer.observe(el);
    });

    // Navigation Scroll Effect
    const nav = document.querySelector('nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // Define the animation class in JS for simplicity (or could be in CSS)
    const style = document.createElement('style');
    style.textContent = `
        .animate-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);

    // Form Submission (Mock)
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button');
            const originalHTML = contactForm.innerHTML;
            
            btn.textContent = 'Processing...';
            btn.disabled = true;

            setTimeout(() => {
                contactForm.classList.add('success');
                contactForm.innerHTML = `
                    <div class="success-icon">
                        <i data-lucide="check" style="width: 40px; height: 40px;"></i>
                    </div>
                    <div class="success-message">
                        <h3>Message Received</h3>
                        <p>Thank you for reaching out. I'll get back to you within 24 hours.</p>
                    </div>
                `;
                lucide.createIcons();
                
                setTimeout(() => {
                    contactForm.classList.remove('success');
                    contactForm.innerHTML = originalHTML;
                    // Re-bind submit listener since we replaced innerHTML
                    bindFormEvents(document.querySelector('.contact-form'));
                    lucide.createIcons();
                }, 5000);
            }, 1500);
        });
    }

    // Wrap form logic in a function for re-binding
    function bindFormEvents(form) {
        if (!form) return;
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button');
            const originalHTML = form.innerHTML;
            
            btn.textContent = 'Processing...';
            btn.disabled = true;

            setTimeout(() => {
                form.classList.add('success');
                form.innerHTML = `
                    <div class="success-icon">
                        <i data-lucide="check" style="width: 40px; height: 40px;"></i>
                    </div>
                    <div class="success-message">
                        <h3>Message Received</h3>
                        <p>Thank you for reaching out. I'll get back to you within 24 hours.</p>
                    </div>
                `;
                lucide.createIcons();
                
                setTimeout(() => {
                    form.classList.remove('success');
                    form.innerHTML = originalHTML;
                    bindFormEvents(form);
                    lucide.createIcons();
                }, 5000);
            }, 1500);
        });
    }

    // Smooth scroll for internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
});
