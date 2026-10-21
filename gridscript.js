document.addEventListener('DOMContentLoaded', () => {
    // ==========================================================================
    // 🔍 1. DOM ELEMENTS MAPPING (क्रैश-प्रूफ चेकिंग के साथ)
    // ==========================================================================
    const viewToggleBtn = document.getElementById('view-toggle-btn');
    const productsWrapper = document.getElementById('products-wrapper');
    const productCards = document.querySelectorAll('.product-card');
    const searchBox = document.getElementById('search-box');
    const companyCheckboxes = document.querySelectorAll('.company-select');
    const productCheckboxes = document.querySelectorAll('.product-select-checkbox');
    const selectedCountSpan = document.getElementById('selected-count');
    const categoryLinks = document.querySelectorAll('.category-link');
    const resetSelectionBtn = document.getElementById('reset-selection-btn');
    
    // एक्शन बटन्स
    const btnXlsx = document.querySelector('.btn-xlsx');
    const btnWhatsapp = document.querySelector('.btn-whatsapp');

    // पॉपअप (Modal) एलिमेंट्स
    const modalOverlay = document.getElementById('product-modal');
    const modalTitle = document.getElementById('modal-product-title');
    const modalDetails = document.getElementById('modal-product-details');
    const modalXCloseBtn = document.getElementById('modal-close-x-btn');
    const modalExploreDepthBtn = document.getElementById('modal-explore-depth-btn');

    let activeCategory = 'show all';

    // ==========================================================================
    // 🔄 2. GRID / LIST VIEW TOGGLE FUNCTION (फुली फिक्स्ड)
    // ==========================================================================
    if (viewToggleBtn && productsWrapper) {
        viewToggleBtn.addEventListener('click', (e) => {
            e.preventDefault(); // किसी भी डिफ़ॉल्ट इवेंट को रोकने के लिए
            const isList = productsWrapper.classList.toggle('list-mode');
            
            // बटन के अंदर के टेक्स्ट को सुरक्षित तरीके से बदलना
            const textSpan = viewToggleBtn.querySelector('.text');
            if (textSpan) {
                textSpan.textContent = isList ? 'Switch to Grid View' : 'Switch to List View';
            } else {
                viewToggleBtn.textContent = isList ? 'Switch to Grid View' : 'Switch to List View';
            }
        });
    }

    // ==========================================================================
    // 🔢 3. COUNTER & RESET SELECTION MODULE
    // ==========================================================================
    function updateCounter() {
        const checkedCount = document.querySelectorAll('.product-select-checkbox:checked').length;
        if (selectedCountSpan) {
            selectedCountSpan.textContent = checkedCount;
        }

        // रीसेट (Clear Selection) बटन को दिखाने/छिपाने का लॉजिक
        if (resetSelectionBtn) {
            if (checkedCount > 0) {
                resetSelectionBtn.style.setProperty('display', 'inline-block', 'important');
            } else {
                resetSelectionBtn.style.setProperty('display', 'none', 'important');
            }
        }
    }
    
    if (productCheckboxes.length > 0) {
        productCheckboxes.forEach(cb => cb.addEventListener('change', updateCounter));
    }

    if (resetSelectionBtn) {
        resetSelectionBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (productCheckboxes.length > 0) {
                productCheckboxes.forEach(cb => { cb.checked = false; });
            }
            updateCounter();
        });
    }

    // ==========================================================================
    // 🔍 4. MASTER TRI-FILTER PIPELINE (सर्च + कंपनी + कैटेगरी)
    // ==========================================================================
    function executeMasterFilter() {
        if (productCards.length === 0) return;
        
        const query = searchBox ? searchBox.value.toLowerCase().trim() : '';
        
        // एक्टिव कंपनी फ़िल्टर्स की लिस्ट बनाना
        const checkedCompanies = Array.from(companyCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => {
                const labelText = cb.closest('.filter-checkbox')?.querySelector('.label-text');
                return labelText ? labelText.textContent.toLowerCase().trim() : '';
            });

        productCards.forEach(card => {
            const brandElement = card.querySelector('.brand-name');
            const bodyElement = card.querySelector('.card-body');
            
            const brand = brandElement ? brandElement.textContent.toLowerCase() : '';
            const content = bodyElement ? bodyElement.textContent.toLowerCase() : '';

            // A. कंपनी मैचिंग नोड
            let matchCompany = checkedCompanies.length === 0; // अगर कोई चेक नहीं है तो सब दिखेगा
            checkedCompanies.forEach(comp => {
                if (comp && (brand.includes(comp) || comp.includes(brand) ||
                    (comp === "johnson & johnson" && brand.includes("monocryl")) ||
                    (comp === "healthium" && brand.includes("truglyde")) ||
                    (comp === "meril life" && brand.includes("meril")) ||
                    (comp === "lotus surgical" && brand.includes("mendil")))) {
                    matchCompany = true;
                }
            });

            // B. सर्च मैचिंग नोड
            const matchSearch = brand.includes(query) || content.includes(query);

            // C. कैटेगरी मैचिंग नोड
            let matchCategory = false;
            if (activeCategory === 'show all') matchCategory = true;
            else if (activeCategory === 'surgical sutures' && (brand.includes('monocryl') || brand.includes('truglyde') || brand.includes('mitsu'))) matchCategory = true;
            else if (activeCategory === 'analgesics' && brand.includes('meril')) matchCategory = true;
            else if (activeCategory === 'gastro' && brand.includes('mendil')) matchCategory = true;

            // अंतिम निर्णय: रेंडर या हाइड
            if (matchCompany && matchSearch && matchCategory) {
                card.style.display = productsWrapper?.classList.contains('list-mode') ? "grid" : "flex";
            } else {
                card.style.display = "none";
            }
        });
    }

    // इवेंट्स को बाइंड करना (सिर्फ तभी जब एलिमेंट मौजूद हो)
    if (categoryLinks.length > 0) {
        categoryLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                categoryLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                activeCategory = link.textContent.toLowerCase().trim();
                executeMasterFilter();
            });
        });
    }

    if (searchBox) searchBox.addEventListener('input', executeMasterFilter);
    if (companyCheckboxes.length > 0) {
        companyCheckboxes.forEach(cb => cb.addEventListener('change', executeMasterFilter));
    }

    // ==========================================================================
    // 🔬 5. DYNAMIC MODAL ENGINE WITH DETAILS ROUTING
    // ==========================================================================
    if (productCards.length > 0 && modalOverlay) {
        productCards.forEach(card => {
            const viewBtn = card.querySelector('.btn-view-more');
            if (viewBtn) {
                viewBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const brandElement = card.querySelector('.brand-name');
                    const costElement = card.querySelector('.product-price');
                    const rows = card.querySelectorAll('.info-row');
                    
                    const title = brandElement ? brandElement.textContent : 'Product Specs';
                    const cost = costElement ? costElement.textContent : '';

                    if (modalTitle) modalTitle.innerHTML = `🔬 Spec Analysis: ${title}`;
                    
                    let modalHTML = '';
                    if (rows.length > 0) {
                        rows.forEach(r => { modalHTML += `<div class="modal-body-row">${r.innerHTML}</div>`; });
                    }
                    modalHTML += `<div class="modal-body-row"><strong>Global Logistics Valuation:</strong> ${cost}</div>`;

                    if (modalDetails) modalDetails.innerHTML = modalHTML;

                    // डायनामिक यूआरएल असाइनमेंट
                    if (modalExploreDepthBtn) {
                        const formattedParam = encodeURIComponent(title.toLowerCase().replace(/\s+/g, '-'));
                        modalExploreDepthBtn.setAttribute('href', `details.html?product=${formattedParam}`);
                    }

                    modalOverlay.classList.add('active');
                });
            }
        });
    }

    if (modalXCloseBtn) {
        modalXCloseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            modalOverlay.classList.remove('active');
        });
    }
    
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) modalOverlay.classList.remove('active');
        });
    }

    // ==========================================================================
    // 💾 6. EXCEL EXPORT NODE
    // ==========================================================================
    if (btnXlsx) {
        btnXlsx.addEventListener('click', (e) => {
            e.preventDefault();
            const selected = document.querySelectorAll('.product-select-checkbox:checked');
            if (selected.length === 0) { alert('Please select at least one asset to compile.'); return; }


let csv = "data:text/csv;charset=utf-8,Asset Profile,Rate Bracket\n";
            selected.forEach(cb => {
                const card = cb.closest('.product-card');
                const brand = card?.querySelector('.brand-name')?.textContent || 'Unknown';
                const price = card?.querySelector('.product-price')?.textContent || '0';
                
                // 🌟 बैक टिक (`) और सही न्यू-लाइन पोजीशन का उपयोग:
                csv += `"${brand}","${price}"\n`;
            });

const dl = document.createElement("a");
dl.setAttribute("href", encodeURI(csv));
dl.setAttribute("download", "surgical_asset_matrix.csv");
document.body.appendChild(dl);
dl.click();
document.body.removeChild(dl);
});
}
    // ==========================================================================
    // 💬 7. WHATSAPP BRIDGE NODE (फिक्स्ड वेरिएबल नाम)
    // ==========================================================================
    if (btnWhatsapp) {
        btnWhatsapp.addEventListener('click', (e) => {
            e.preventDefault();
            const selected = document.querySelectorAll('.product-select-checkbox:checked');
            if (selected.length === 0) { 
                alert('Select clinical profiles before dispatching.'); 
                return; 
            }

            let text = "✨ *Surgical Asset Optimization Manifest* ✨\n\n";
            selected.forEach((cb, idx) => {
                const card = cb.closest('.product-card');
                const brand = card?.querySelector('.brand-name')?.textContent || 'Unknown';
                const price = card?.querySelector('.product-price')?.textContent || '0';
                text += `${idx + 1}. *${brand}* | ${price}\n`;
            });

                    // 🌟 बिल्कुल सही और फिक्स यूआरएल सिंटैक्स
            window.open(`https://whatsapp.com{encodeURIComponent(text)}`, "_blank");
        });
    }
});
