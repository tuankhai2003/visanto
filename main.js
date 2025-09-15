import { timelineData, pestData } from './data.js';

document.addEventListener('DOMContentLoaded', function () {
    // 1. Lấy các phần tử HTML cần thiết
    const tabs = document.querySelectorAll('.nav-tab');
    const sections = document.querySelectorAll('.content-section');
    const timelineNav = document.getElementById('timeline-nav');
    const timelineContent = document.getElementById('timeline-content');
    const pestGrid = document.getElementById('pest-grid');
    const pestTypeFilter = document.getElementById('pest-type-filter');
    const pestStageFilter = document.getElementById('pest-stage-filter');
    const modal = document.getElementById('pestModal');
    const closeModalBtn = document.getElementById('closeModal');
    const modalBody = document.getElementById('modal-body');

    const stageNames = {
        prep: 'Chuẩn bị',
        growth: 'Sinh trưởng',
        reproduction: 'Làm đòng - Trổ',
        ripening: 'Chín - Thu hoạch'
    };

    // 2. Biên dịch mẫu Handlebars từ templates.html
    let pestCardTemplate, pestModalTemplate;
    
    const cardTemplateSource = document.getElementById('pest-card-template');
    const modalTemplateSource = document.getElementById('pest-modal-template');

    if (cardTemplateSource && modalTemplateSource) {
        pestCardTemplate = Handlebars.compile(cardTemplateSource.innerHTML);
        pestModalTemplate = Handlebars.compile(modalTemplateSource.innerHTML);
    } else {
        console.error("Handlebars templates not found in the DOM. Check templates.html file.");
    }
    
    // 3. Logic chung cho chuyển tab
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;
            tabs.forEach(t => t.classList.replace('tab-active', 'tab-inactive'));
            tab.classList.replace('tab-inactive', 'tab-active');
            sections.forEach(section => {
                if (section.id === target) {
                    section.classList.add('active');
                } else {
                    section.classList.remove('active');
                }
            });
            if (target === 'program') {
                renderTimeline();
            } else if (target === 'diagnostics') {
                renderPests();
            }
        });
    });

    // 4. Logic cho phần Quy trình Canh tác
    function renderTimeline() {
        if (!timelineNav || !timelineContent) return;
        timelineNav.innerHTML = '';
        
        Object.keys(timelineData).forEach((key, index) => {
            const data = timelineData[key];
            const button = document.createElement('button');
            button.className = `timeline-btn text-sm sm:text-base font-semibold py-2 px-4 rounded-full border border-gray-300 transition-all duration-300 ${index === 0 ? 'tab-active' : 'tab-inactive'}`;
            button.dataset.key = key;
            button.textContent = data.name;
            button.addEventListener('click', () => {
                document.querySelectorAll('.timeline-btn').forEach(btn => btn.classList.replace('tab-active', 'tab-inactive'));
                button.classList.replace('tab-inactive', 'tab-active');
                timelineContent.innerHTML = timelineData[key].content;
            });
            timelineNav.appendChild(button);
        });
        
        if (Object.keys(timelineData).length > 0) {
            const firstKey = Object.keys(timelineData)[0];
            timelineContent.innerHTML = timelineData[firstKey].content;
        }
    }

    // 5. Logic cho phần Chẩn đoán & Giải pháp (sử dụng Handlebars)
    function renderPests() {
        if (!pestGrid || !pestTypeFilter || !pestStageFilter) return;
        
        if (pestStageFilter.options.length <= 1) {
            Object.keys(stageNames).forEach(key => {
                pestStageFilter.add(new Option(stageNames[key], key));
            });
        }
        
        const type = pestTypeFilter.value;
        const stage = pestStageFilter.value;
        const filteredPests = pestData.filter(pest => (type === 'all' || pest.type === type) && (stage === 'all' || pest.stage === stage));

        if (filteredPests.length === 0) {
            pestGrid.innerHTML = `<p class="col-span-full text-center text-gray-500">Không tìm thấy vấn đề phù hợp.</p>`;
            return;
        }

        const htmlCards = filteredPests.map(pest => {
            const data = { ...pest, stageName: stageNames[pest.stage] };
            return pestCardTemplate(data);
        });
        pestGrid.innerHTML = htmlCards.join('');

        document.querySelectorAll('[data-pest-id]').forEach(card => {
            card.addEventListener('click', () => {
                const pestId = parseInt(card.dataset.pestId);
                const pest = pestData.find(p => p.id === pestId);
                showPestDetail(pest);
            });
        });
    }

    function showPestDetail(pest) {
        if (!modalBody || !modal) return;
        modalBody.innerHTML = pestModalTemplate(pest);
        modal.style.display = 'block';
    }

    if (pestTypeFilter) pestTypeFilter.addEventListener('change', renderPests);
    if (pestStageFilter) pestStageFilter.addEventListener('change', renderPests);
    if (closeModalBtn) closeModalBtn.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (event) => { if (event.target == modal) modal.style.display = 'none'; });

    // 6. Chạy các hàm render ban đầu
    const initialTab = document.querySelector('.nav-tab.tab-active');
    if (initialTab) {
        initialTab.click();
    } else {
        document.querySelector('[data-tab="principles"]').click();
    }
});
