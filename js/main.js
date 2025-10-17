// AI 앱 매니저 - 메인 JavaScript

let currentRating = 0;
let currentEditRating = 0;

// DOM 로드 완료 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadApps();
});

// 앱 초기화
function initializeApp() {
    console.log('AI 앱 매니저 초기화 중...');
    
    // 별점 시스템 초기화
    initializeRatingSystem();
    
    // 폼 유효성 검사 초기화
    initializeFormValidation();
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 앱 등록 폼 제출
    const form = document.getElementById('app-registration-form');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    
    // 앱 편집 폼 제출
    const editForm = document.getElementById('edit-app-form');
    if (editForm) {
        editForm.addEventListener('submit', handleEditFormSubmit);
    }
    
    // 검색 및 필터 기능
    const searchInput = document.getElementById('search-apps');
    const categoryFilter = document.getElementById('filter-category');
    const clearFiltersBtn = document.getElementById('clear-filters');
    
    if (searchInput) {
        searchInput.addEventListener('input', debounce(filterApps, 300));
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterApps);
    }
    
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearAllFilters);
    }
    
    // 카테고리 체크박스 변경 시 에러 메시지 숨김
    const categoryCheckboxes = document.querySelectorAll('.category-checkbox');
    categoryCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', hideCategoriesError);
    });
}

// 별점 시스템 초기화
function initializeRatingSystem() {
    // 등록 폼 별점 시스템
    initializeRatingStars('.rating-stars', '#app-rating', '.rating-text');
    
    // 편집 폼 별점 시스템
    initializeRatingStars('.edit-rating-stars', '#edit-app-rating', '.edit-rating-text');
}

// 별점 시스템 공통 초기화 함수
function initializeRatingStars(starsSelector, inputSelector, textSelector) {
    const stars = document.querySelectorAll(`${starsSelector} i`);
    const ratingText = document.querySelector(textSelector);
    const ratingInput = document.getElementById(inputSelector.replace('#', ''));
    
    if (!stars.length || !ratingInput) return;
    
    const isEditForm = starsSelector.includes('edit');
    let localRating = 0;
    
    stars.forEach((star, index) => {
        star.addEventListener('click', function() {
            const rating = index + 1;
            localRating = rating;
            ratingInput.value = rating;
            
            if (isEditForm) {
                currentEditRating = rating;
            } else {
                currentRating = rating;
            }
            
            // 별점 업데이트
            updateStarsDisplay(stars, rating);
            
            // 텍스트 업데이트
            if (ratingText) {
                const ratingLabels = ['', '별로예요', '보통이에요', '좋아요', '매우 좋아요', '최고예요'];
                ratingText.textContent = ratingLabels[rating];
            }
        });
        
        // 호버 효과
        star.addEventListener('mouseenter', function() {
            const hoverRating = index + 1;
            updateStarsDisplay(stars, hoverRating);
        });
    });
    
    // 마우스 떠날 때 원래 별점으로 복구
    const ratingContainer = document.querySelector(starsSelector);
    if (ratingContainer) {
        ratingContainer.addEventListener('mouseleave', function() {
            const currentRatingValue = isEditForm ? currentEditRating : currentRating;
            updateStarsDisplay(stars, currentRatingValue);
        });
    }
}

// 별점 표시 업데이트 (공통)
function updateStarsDisplay(stars, rating) {
    stars.forEach((star, index) => {
        if (index < rating) {
            star.className = 'fas fa-star text-2xl text-yellow-400 cursor-pointer transition-colors';
        } else {
            star.className = 'far fa-star text-2xl text-gray-300 cursor-pointer hover:text-yellow-400 transition-colors';
        }
    });
}

// 별점 표시 업데이트 (등록 폼용)
function updateStarDisplay(rating) {
    const stars = document.querySelectorAll('.rating-stars i');
    updateStarsDisplay(stars, rating);
}

// 편집 폼 별점 표시 업데이트
function updateEditStarDisplay(rating) {
    const stars = document.querySelectorAll('.edit-rating-stars i');
    updateStarsDisplay(stars, rating);
    
    const ratingText = document.querySelector('.edit-rating-text');
    if (ratingText) {
        const ratingLabels = ['평점을 선택하세요', '별로예요', '보통이에요', '좋아요', '매우 좋아요', '최고예요'];
        ratingText.textContent = ratingLabels[rating] || ratingLabels[0];
    }
}

// 폼 유효성 검사 초기화
function initializeFormValidation() {
    const form = document.getElementById('app-registration-form');
    const inputs = form.querySelectorAll('input[required], select[required]');
    
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
}

// 개별 필드 유효성 검사
function validateField(event) {
    const field = event.target;
    const value = field.value.trim();
    
    // 기존 에러 메시지 제거
    clearFieldError(event);
    
    if (!value) {
        showFieldError(field, '이 필드는 필수입니다.');
        return false;
    }
    
    // URL 유효성 검사
    if (field.type === 'url' && value) {
        try {
            new URL(value);
        } catch {
            showFieldError(field, '올바른 URL을 입력해주세요.');
            return false;
        }
    }
    
    return true;
}

// 필드 에러 표시
function showFieldError(field, message) {
    field.classList.add('border-red-500', 'focus:ring-red-500');
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'text-red-500 text-sm mt-1 error-message';
    errorDiv.textContent = message;
    
    field.parentNode.appendChild(errorDiv);
}

// 필드 에러 제거
function clearFieldError(event) {
    const field = event.target;
    field.classList.remove('border-red-500', 'focus:ring-red-500');
    
    const errorMsg = field.parentNode.querySelector('.error-message');
    if (errorMsg) {
        errorMsg.remove();
    }
}

// 폼 제출 처리
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    
    // 로딩 상태
    submitButton.innerHTML = '<div class="loading-spinner"></div>등록 중...';
    submitButton.disabled = true;
    
    try {
        // 폼 데이터 수집
        const formData = new FormData(form);
        
        // 선택된 카테고리들 수집
        const selectedCategories = [];
        const categoryCheckboxes = document.querySelectorAll('input[name="categories"]:checked');
        categoryCheckboxes.forEach(checkbox => {
            selectedCategories.push(checkbox.value);
        });
        
        const subscriptionStatus = formData.get('subscription_status') || 'free';
        
        const appData = {
            name: formData.get('name').trim(),
            url: formData.get('url').trim(),
            categories: selectedCategories,
            description: formData.get('description').trim(),
            icon_url: formData.get('icon_url').trim() || '',
            tags: formData.get('tags') ? formData.get('tags').split(',').map(tag => tag.trim()).filter(tag => tag) : [],
            rating: parseInt(formData.get('rating')) || 0,
            is_favorite: formData.get('is_favorite') === 'on',
            usage_count: 0,
            last_used: null,
            subscription_status: subscriptionStatus,
            subscription_plan: subscriptionStatus !== 'free' ? formData.get('subscription_plan')?.trim() || '' : '',
            subscription_price: subscriptionStatus !== 'free' ? parseFloat(formData.get('subscription_price')) || 0 : 0,
            billing_cycle: subscriptionStatus !== 'free' ? formData.get('billing_cycle') || 'monthly' : null,
            next_billing_date: subscriptionStatus !== 'free' ? formData.get('next_billing_date') || null : null,
            subscription_start_date: subscriptionStatus !== 'free' ? formData.get('subscription_start_date') || null : null
        };
        
        // 유효성 검사
        if (!validateAppData(appData)) {
            throw new Error('입력 데이터를 확인해주세요.');
        }
        
        // 서버에 데이터 저장
        const response = await fetch('tables/ai_apps', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(appData)
        });
        
        if (!response.ok) {
            throw new Error('앱 등록에 실패했습니다.');
        }
        
        const result = await response.json();
        console.log('앱 등록 성공:', result);
        
        // 성공 처리
        showSuccessModal();
        form.reset();
        currentRating = 0;
        updateStarDisplay(0);
        document.querySelector('.rating-text').textContent = '평점을 선택하세요';
        
        // 카테고리 체크박스 초기화
        const registrationCategoryCheckboxes = document.querySelectorAll('.category-checkbox');
        registrationCategoryCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        hideCategoriesError();
        
        // 앱 목록 새로고침
        await loadApps();
        
    } catch (error) {
        console.error('앱 등록 오류:', error);
        showErrorMessage(error.message);
    } finally {
        // 로딩 상태 해제
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    }
}

// 앱 데이터 유효성 검사
function validateAppData(data) {
    if (!data.name) {
        showErrorMessage('앱 이름을 입력해주세요.');
        return false;
    }
    
    if (!data.url) {
        showErrorMessage('앱 URL을 입력해주세요.');
        return false;
    }
    
    if (!data.categories || data.categories.length === 0) {
        showErrorMessage('최소 하나의 카테고리를 선택해주세요.');
        showCategoriesError();
        return false;
    }
    
    try {
        new URL(data.url);
    } catch {
        showErrorMessage('올바른 URL을 입력해주세요.');
        return false;
    }
    
    return true;
}

// 카테고리 에러 표시
function showCategoriesError() {
    const errorElement = document.getElementById('categories-error');
    if (errorElement) {
        errorElement.classList.remove('hidden');
    }
}

// 카테고리 에러 숨김
function hideCategoriesError() {
    const errorElement = document.getElementById('categories-error');
    if (errorElement) {
        errorElement.classList.add('hidden');
    }
}

// 앱 목록 로드 (다중 테이블)
async function loadApps() {
    try {
        // 모든 테이블에서 데이터 가져오기
        const [mainResponse, creativeResponse, toolsResponse] = await Promise.all([
            fetch('tables/ai_apps?limit=100&sort=created_at'),
            fetch('tables/ai_apps_creative?limit=100&sort=created_at'),
            fetch('tables/ai_apps_tools?limit=100&sort=created_at')
        ]);

        if (!mainResponse.ok || !creativeResponse.ok || !toolsResponse.ok) {
            throw new Error('앱 목록을 불러오는데 실패했습니다.');
        }
        
        const [mainResult, creativeResult, toolsResult] = await Promise.all([
            mainResponse.json(),
            creativeResponse.json(), 
            toolsResponse.json()
        ]);

        // 모든 앱 데이터 통합
        const allApps = [
            ...(mainResult.data || []),
            ...(creativeResult.data || []),
            ...(toolsResult.data || [])
        ];

        console.log(`총 ${allApps.length}개 앱 로드됨 (메인: ${mainResult.data?.length || 0}, 크리에이티브: ${creativeResult.data?.length || 0}, 도구: ${toolsResult.data?.length || 0})`);
        
        displayApps(allApps);
        
        // 필터 결과 정보 초기화 (전체 목록 표시)
        updateFilterResults(allApps.length, allApps.length, '', '');
        
    } catch (error) {
        console.error('앱 목록 로드 오류:', error);
        // 메인 테이블만이라도 로드 시도
        try {
            const response = await fetch('tables/ai_apps?limit=100&sort=created_at');
            if (response.ok) {
                const result = await response.json();
                displayApps(result.data);
                updateFilterResults(result.data.length, result.data.length, '', '');
            }
        } catch (fallbackError) {
            showErrorMessage('앱 목록을 불러오는데 실패했습니다.');
        }
    }
}

// 앱 목록 정렬 (구독 우선, 영어 알파벳순, 한글 가나다순)
function sortAppsBySubscription(apps) {
    return apps.sort((a, b) => {
        // 1순위: 구독 상태 (paid > trial > free) - 최상단
        const subscriptionPriority = {
            'paid': 3,
            'trial': 2,
            'free': 1
        };
        
        const aPriority = subscriptionPriority[a.subscription_status] || 1;
        const bPriority = subscriptionPriority[b.subscription_status] || 1;
        
        if (aPriority !== bPriority) {
            return bPriority - aPriority; // 유료구독이 최상단
        }
        
        // 2순위: 즐겨찾기 (같은 구독 상태 내에서 즐겨찾기 우선)
        if (a.is_favorite !== b.is_favorite) {
            return b.is_favorite - a.is_favorite;
        }
        
        // 3순위: 언어별 정렬 (영어 알파벳 → 한글 가나다)
        const aName = (a.name || '').trim();
        const bName = (b.name || '').trim();
        
        // 한글 포함 여부 확인
        const aIsKorean = /[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(aName);
        const bIsKorean = /[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(bName);
        
        // 영어가 한글보다 먼저 (A-Z → 가-하)
        if (aIsKorean !== bIsKorean) {
            return aIsKorean ? 1 : -1; // 영어가 앞에
        }
        
        // 같은 언어끼리는 정확한 정렬
        if (aIsKorean && bIsKorean) {
            // 한글끼리는 가나다순
            return aName.localeCompare(bName, 'ko', { numeric: true, sensitivity: 'base' });
        } else {
            // 영어끼리는 알파벳순 (대소문자 구분 없음)
            return aName.toLowerCase().localeCompare(bName.toLowerCase(), 'en', { numeric: true });
        }
    });
}

// 앱 목록 표시
function displayApps(apps) {
    const appsGrid = document.getElementById('apps-grid');
    
    if (!apps || apps.length === 0) {
        appsGrid.innerHTML = `
            <div class="col-span-full empty-state">
                <i class="fas fa-robot"></i>
                <h3>등록된 AI 앱이 없습니다</h3>
                <p>첫 번째 AI 앱을 등록해보세요!</p>
            </div>
        `;
        return;
    }
    
    // 앱 목록 정렬 (유료구독 앱 우선)
    const sortedApps = sortAppsBySubscription(apps);
    
    appsGrid.innerHTML = sortedApps.map(app => createAppCard(app)).join('');
}

// 구독 배지 생성
function generateSubscriptionBadge(app) {
    const status = app.subscription_status || 'free';
    
    if (status === 'free') {
        return ''; // 무료는 배지 없음
    }
    
    let badgeClass = '';
    let badgeText = '';
    let badgeIcon = '';
    
    switch (status) {
        case 'paid':
            badgeClass = 'bg-blue-100 text-blue-800 border-blue-200';
            badgeText = 'PRO';
            badgeIcon = 'fas fa-crown';
            break;
        case 'trial':
            badgeClass = 'bg-yellow-100 text-yellow-800 border-yellow-200';
            badgeText = 'TRIAL';
            badgeIcon = 'fas fa-clock';
            break;
        default:
            return '';
    }
    
    const isExpiring = checkExpirationStatus(app.next_billing_date);
    if (isExpiring) {
        badgeClass = 'bg-red-100 text-red-800 border-red-200';
        badgeIcon = 'fas fa-exclamation-triangle';
    }
    
    return `
        <button onclick="showSubscriptionModal('${app.id}')" 
                class="subscription-badge inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border cursor-pointer hover:opacity-80 transition-opacity ${badgeClass}"
                title="구독 정보 보기">
            <i class="${badgeIcon} mr-1"></i>
            ${badgeText}
            ${isExpiring ? ' ⚠️' : ''}
        </button>
    `;
}

// 앱 카드 생성
function createAppCard(app) {
    const iconHtml = app.icon_url ? 
        `<img src="${app.icon_url}" alt="${app.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
         <div class="app-icon" style="display: none;"><i class="fas fa-robot"></i></div>` :
        `<div class="app-icon"><i class="fas fa-robot"></i></div>`;
    
    const stars = generateStarRating(app.rating || 0);
    const tags = app.tags && app.tags.length > 0 ? 
        app.tags.map(tag => `<span class="app-tag">${tag}</span>`).join('') : '';
    
    // 다중 카테고리 처리
    const categories = app.categories || [];
    const categoryDisplay = categories.length > 0 ? 
        categories.map(cat => `${getCategoryEmoji(cat)} ${cat}`).join(', ') :
        '🤖 미분류';
    
    return `
        <div class="app-card p-6">
            <div class="flex items-start justify-between mb-4">
                <div class="flex items-center space-x-3">
                    ${iconHtml}
                    <div>
                        <div class="flex items-center space-x-2">
                            <h3 class="font-semibold text-lg text-gray-900">${app.name}</h3>
                            ${generateSubscriptionBadge(app)}
                        </div>
                        <p class="text-sm text-gray-600">${categoryDisplay}</p>
                    </div>
                </div>
                <button onclick="toggleFavorite('${app.id}', ${app.is_favorite})" 
                        class="favorite-btn ${app.is_favorite ? 'active' : ''} text-gray-400 hover:text-red-500">
                    <i class="${app.is_favorite ? 'fas' : 'far'} fa-heart"></i>
                </button>
            </div>
            
            ${app.description ? `<p class="text-gray-600 text-sm mb-3 line-clamp-2">${app.description}</p>` : ''}
            
            <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-2">
                    ${stars}
                    <span class="text-sm text-gray-500">(${app.rating || 0})</span>
                </div>
                <span class="text-xs text-gray-500">사용 ${app.usage_count || 0}회</span>
            </div>
            
            ${tags ? `<div class="app-tags mb-4">${tags}</div>` : ''}
            
            <div class="flex space-x-2">
                <button onclick="openApp('${app.id}', '${app.url}')" 
                        class="flex-1 bg-ai-blue text-white py-2 px-4 rounded-lg hover:bg-ai-purple transition-colors text-sm font-medium">
                    <i class="fas fa-external-link-alt mr-2"></i>실행
                </button>
                <button onclick="editApp('${app.id}')" 
                        class="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteApp('${app.id}')" 
                        class="px-3 py-2 border border-gray-300 rounded-lg hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors text-sm">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
}

// 별점 HTML 생성
function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    let stars = '';
    
    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            stars += '<i class="fas fa-star text-yellow-400 text-sm"></i>';
        } else {
            stars += '<i class="far fa-star text-gray-300 text-sm"></i>';
        }
    }
    
    return stars;
}

// 카테고리 이모지 반환
function getCategoryEmoji(category) {
    const emojiMap = {
        '텍스트 & 언어': '📝',
        '이미지 & 비주얼': '🎨',
        '음성 & 오디오': '🎵',
        '개발 & 코딩': '💻',
        '비즈니스 & 생산성': '📊',
        '교육 & 학습': '📚',
        '마케팅 & SEO': '📈'
    };
    return emojiMap[category] || '🤖';
}

// 앱 실행
async function openApp(appId, url) {
    try {
        // 사용 횟수 증가
        await fetch(`tables/ai_apps/${appId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                usage_count: (await getAppUsageCount(appId)) + 1,
                last_used: Date.now()
            })
        });
        
        // 새 창에서 앱 열기
        console.log('앱 실행 중:', url);
        window.open(url, '_blank');
        
        // 목록 새로고침
        await loadApps();
        
    } catch (error) {
        console.error('앱 실행 오류:', error);
        // 오류가 있어도 앱은 실행
        console.log('오류 발생했지만 앱 실행:', url);
        window.open(url, '_blank');
    }
}

// 앱 사용 횟수 가져오기
async function getAppUsageCount(appId) {
    try {
        const response = await fetch(`tables/ai_apps/${appId}`);
        if (response.ok) {
            const app = await response.json();
            return app.usage_count || 0;
        }
    } catch (error) {
        console.error('사용 횟수 조회 오류:', error);
    }
    return 0;
}

// 즐겨찾기 토글
async function toggleFavorite(appId, currentStatus) {
    try {
        const response = await fetch(`tables/ai_apps/${appId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                is_favorite: !currentStatus
            })
        });
        
        if (response.ok) {
            await loadApps();
        }
        
    } catch (error) {
        console.error('즐겨찾기 업데이트 오류:', error);
        showErrorMessage('즐겨찾기 업데이트에 실패했습니다.');
    }
}

// 앱 삭제
async function deleteApp(appId) {
    if (!confirm('정말 이 앱을 삭제하시겠습니까?')) {
        return;
    }
    
    try {
        const response = await fetch(`tables/ai_apps/${appId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            await loadApps();
            showSuccessMessage('앱이 삭제되었습니다.');
        } else {
            throw new Error('삭제에 실패했습니다.');
        }
        
    } catch (error) {
        console.error('앱 삭제 오류:', error);
        showErrorMessage('앱 삭제에 실패했습니다.');
    }
}

// 앱 편집
async function editApp(appId) {
    try {
        // 앱 정보 가져오기
        const response = await fetch(`tables/ai_apps/${appId}`);
        if (!response.ok) {
            throw new Error('앱 정보를 불러오는데 실패했습니다.');
        }
        
        const app = await response.json();
        
        // 편집 폼에 현재 정보 채우기
        document.getElementById('edit-app-id').value = app.id;
        document.getElementById('edit-app-name').value = app.name || '';
        document.getElementById('edit-app-url').value = app.url || '';
        document.getElementById('edit-app-icon').value = app.icon_url || '';
        document.getElementById('edit-app-description').value = app.description || '';
        document.getElementById('edit-app-tags').value = app.tags ? app.tags.join(', ') : '';
        document.getElementById('edit-app-rating').value = app.rating || 0;
        document.getElementById('edit-app-favorite').checked = app.is_favorite || false;
        
        // 카테고리 체크박스 설정
        const editCategoryCheckboxes = document.querySelectorAll('input[name="edit-categories"]');
        editCategoryCheckboxes.forEach(checkbox => {
            checkbox.checked = false; // 먼저 모든 체크박스 해제
        });
        
        // 앱의 카테고리들을 체크
        const appCategories = app.categories || [];
        appCategories.forEach(category => {
            const checkbox = document.querySelector(`input[name="edit-categories"][value="${category}"]`);
            if (checkbox) {
                checkbox.checked = true;
            }
        });
        
        // 별점 표시 업데이트
        currentEditRating = app.rating || 0;
        updateEditStarDisplay(app.rating || 0);
        
        // 구독 정보 로딩
        loadEditSubscriptionInfo(app);
        
        // 편집 모달 표시
        document.getElementById('edit-modal').classList.remove('hidden');
        
    } catch (error) {
        console.error('앱 편집 오류:', error);
        showErrorMessage('앱 정보를 불러오는데 실패했습니다.');
    }
}

// 편집 폼 제출 처리
async function handleEditFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    
    // 로딩 상태
    submitButton.innerHTML = '<div class="loading-spinner"></div>수정 중...';
    submitButton.disabled = true;
    
    try {
        const formData = new FormData(form);
        const appId = formData.get('app_id');
        
        // 선택된 카테고리들 수집 (편집 모달)
        const selectedCategories = [];
        const categoryCheckboxes = document.querySelectorAll('input[name="edit-categories"]:checked');
        categoryCheckboxes.forEach(checkbox => {
            selectedCategories.push(checkbox.value);
        });
        
        // 구독 정보 수집
        const subscriptionData = collectEditSubscriptionData(formData);
        
        const updatedData = {
            name: formData.get('name').trim(),
            url: formData.get('url').trim(),
            categories: selectedCategories,
            description: formData.get('description').trim(),
            icon_url: formData.get('icon_url').trim() || '',
            tags: formData.get('tags') ? formData.get('tags').split(',').map(tag => tag.trim()).filter(tag => tag) : [],
            rating: parseInt(formData.get('rating')) || 0,
            is_favorite: formData.get('is_favorite') === 'on',
            ...subscriptionData
        };
        
        // 유효성 검사
        if (!validateAppData(updatedData)) {
            throw new Error('입력 데이터를 확인해주세요.');
        }
        
        // 서버에 데이터 업데이트
        const response = await fetch(`tables/ai_apps/${appId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData)
        });
        
        if (!response.ok) {
            throw new Error('앱 수정에 실패했습니다.');
        }
        
        const result = await response.json();
        console.log('앱 수정 성공:', result);
        
        // 성공 처리
        closeEditModal();
        showSuccessMessage('앱 정보가 성공적으로 수정되었습니다.');
        
        // 앱 목록 새로고침
        await loadApps();
        
    } catch (error) {
        console.error('앱 수정 오류:', error);
        showErrorMessage(error.message);
    } finally {
        // 로딩 상태 해제
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    }
}

// 편집 모달 닫기
function closeEditModal() {
    document.getElementById('edit-modal').classList.add('hidden');
    
    // 폼 리셋
    const form = document.getElementById('edit-app-form');
    if (form) {
        form.reset();
        currentEditRating = 0;
        updateEditStarDisplay(0);
        
        // 편집 카테고리 체크박스 초기화
        const editCategoryCheckboxes = document.querySelectorAll('.edit-category-checkbox');
        editCategoryCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // 구독 필드 초기화
        document.getElementById('edit-subscription-status').value = 'free';
        toggleEditSubscriptionFields();
    }
}

// 앱 필터링 (다중 테이블)
async function filterApps() {
    const searchTerm = document.getElementById('search-apps').value.toLowerCase().trim();
    const categoryFilter = document.getElementById('filter-category').value;
    
    try {
        // 모든 테이블에서 데이터 가져오기
        const [mainResponse, creativeResponse, toolsResponse] = await Promise.all([
            fetch('tables/ai_apps?limit=100&sort=created_at'),
            fetch('tables/ai_apps_creative?limit=100&sort=created_at'),
            fetch('tables/ai_apps_tools?limit=100&sort=created_at')
        ]);

        const responses = await Promise.all([
            mainResponse.ok ? mainResponse.json() : { data: [] },
            creativeResponse.ok ? creativeResponse.json() : { data: [] },
            toolsResponse.ok ? toolsResponse.json() : { data: [] }
        ]);

        // 모든 앱 데이터 통합
        const allApps = [
            ...(responses[0].data || []),
            ...(responses[1].data || []),
            ...(responses[2].data || [])
        ];
        
        let filteredApps = allApps;
        
        // 카테고리 필터 적용 (다중 카테고리 지원)
        if (categoryFilter) {
            filteredApps = filteredApps.filter(app => {
                const categories = app.categories || [];
                return categories.includes(categoryFilter);
            });
        }
        
        // 검색어 필터 적용
        if (searchTerm) {
            filteredApps = filteredApps.filter(app => {
                const searchableText = [
                    app.name,
                    app.description,
                    ...(app.tags || [])
                ].join(' ').toLowerCase();
                
                return searchableText.includes(searchTerm);
            });
        }
        
        // 필터된 결과 표시
        displayApps(filteredApps);
        
        // 필터 결과 정보 업데이트
        updateFilterResults(filteredApps.length, allApps.length, searchTerm, categoryFilter);
        
    } catch (error) {
        console.error('앱 필터링 오류:', error);
        showErrorMessage('검색 중 오류가 발생했습니다.');
    }
}

// 필터 결과 정보 업데이트
function updateFilterResults(filteredCount, totalCount, searchTerm, categoryFilter) {
    const resultsElement = document.getElementById('filter-results');
    const resultsCountElement = document.getElementById('results-count');
    const clearFiltersBtn = document.getElementById('clear-filters');
    
    const hasFilters = searchTerm || categoryFilter;
    
    if (hasFilters) {
        let resultText = `총 ${totalCount}개 중 ${filteredCount}개 앱`;
        
        if (searchTerm && categoryFilter) {
            const categoryEmoji = getCategoryEmoji(categoryFilter);
            resultText += ` (카테고리: ${categoryEmoji} ${categoryFilter}, 검색: "${searchTerm}")`;
        } else if (categoryFilter) {
            const categoryEmoji = getCategoryEmoji(categoryFilter);
            resultText += ` (카테고리: ${categoryEmoji} ${categoryFilter})`;
        } else if (searchTerm) {
            resultText += ` (검색: "${searchTerm}")`;
        }
        
        resultsCountElement.textContent = resultText;
        resultsElement.classList.remove('hidden');
        clearFiltersBtn.classList.remove('hidden');
    } else {
        resultsElement.classList.add('hidden');
        clearFiltersBtn.classList.add('hidden');
    }
}

// 필터 초기화
function clearAllFilters() {
    document.getElementById('search-apps').value = '';
    document.getElementById('filter-category').value = '';
    loadApps(); // 전체 목록 다시 로드
}

// 화면 전환 함수들
function showRegistration() {
    document.getElementById('registration-section').classList.remove('hidden');
    document.getElementById('app-list-section').classList.add('hidden');
    
    // 네비게이션 업데이트
    updateNavigation('registration');
}

function showAppList() {
    document.getElementById('registration-section').classList.add('hidden');
    document.getElementById('app-list-section').classList.remove('hidden');
    
    // 네비게이션 업데이트
    updateNavigation('list');
    
    // 앱 목록 로드
    loadApps();
}

// 네비게이션 업데이트
function updateNavigation(activeSection) {
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.classList.remove('text-ai-blue', 'font-medium', 'border-b-2', 'border-ai-blue', 'pb-2');
        link.classList.add('text-gray-600', 'hover:text-gray-900');
    });
    
    if (activeSection === 'registration') {
        const regLink = navLinks[0];
        regLink.classList.remove('text-gray-600', 'hover:text-gray-900');
        regLink.classList.add('text-ai-blue', 'font-medium', 'border-b-2', 'border-ai-blue', 'pb-2');
    } else if (activeSection === 'list') {
        const listLink = navLinks[1];
        listLink.classList.remove('text-gray-600', 'hover:text-gray-900');
        listLink.classList.add('text-ai-blue', 'font-medium', 'border-b-2', 'border-ai-blue', 'pb-2');
    }
}

// 성공 모달 표시
function showSuccessModal() {
    document.getElementById('success-modal').classList.remove('hidden');
}

// 성공 모달 닫기
function closeSuccessModal() {
    document.getElementById('success-modal').classList.add('hidden');
}

// 에러 메시지 표시
function showErrorMessage(message) {
    // 간단한 alert로 표시 (향후 토스트 메시지로 개선 가능)
    alert('오류: ' + message);
}

// 성공 메시지 표시
function showSuccessMessage(message) {
    alert('성공: ' + message);
}

// 파비콘 자동 가져오기
function tryFavicon() {
    const urlInput = document.getElementById('app-url');
    const iconInput = document.getElementById('app-icon');
    
    const url = urlInput.value.trim();
    if (!url) {
        showErrorMessage('먼저 앱 URL을 입력해주세요.');
        return;
    }
    
    try {
        const urlObj = new URL(url);
        const faviconUrl = `${urlObj.protocol}//${urlObj.hostname}/favicon.ico`;
        iconInput.value = faviconUrl;
        showSuccessMessage('파비콘 URL이 설정되었습니다. 등록 후 확인해보세요!');
    } catch {
        showErrorMessage('올바른 URL을 먼저 입력해주세요.');
    }
}

// 이미지 업로드 가이드 표시
function showImageUploadTip() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-lg mx-4 max-h-[80vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold text-gray-900">🖼️ 로고 이미지 업로드 가이드</h3>
                <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="space-y-4">
                <div class="border-l-4 border-blue-500 pl-4">
                    <h4 class="font-semibold mb-2">방법 1: 프로젝트에 직접 업로드 (권장)</h4>
                    <ol class="list-decimal list-inside space-y-1 text-sm text-gray-700">
                        <li>노트북의 로고 이미지 파일 준비 (PNG, JPG, SVG)</li>
                        <li>이 프로젝트의 <code class="bg-gray-100 px-1 rounded">images/</code> 폴더에 업로드</li>
                        <li>아이콘 URL에 <code class="bg-gray-100 px-1 rounded">images/파일명.png</code> 입력</li>
                    </ol>
                    <p class="text-xs text-green-600 mt-2">✅ 추천: 빠르고 안정적, 오프라인에서도 작동</p>
                </div>
                
                <div class="border-l-4 border-yellow-500 pl-4">
                    <h4 class="font-semibold mb-2">방법 2: 온라인 이미지 호스팅</h4>
                    <ul class="list-disc list-inside space-y-1 text-sm text-gray-700">
                        <li><strong>Imgur</strong>: imgur.com (무료, 회원가입 불필요)</li>
                        <li><strong>GitHub Issues</strong>: 이슈에 이미지 드래그앤드롭하면 URL 생성</li>
                        <li><strong>Google Drive</strong>: 공개 링크 생성 후 직접 링크로 변환</li>
                    </ul>
                </div>
                
                <div class="border-l-4 border-green-500 pl-4">
                    <h4 class="font-semibold mb-2">방법 3: 웹사이트 파비콘 사용</h4>
                    <p class="text-sm text-gray-700 mb-2">대부분의 AI 서비스는 파비콘을 제공합니다:</p>
                    <div class="bg-gray-100 p-2 rounded text-xs">
                        <p><strong>ChatGPT:</strong> https://chat.openai.com/favicon.ico</p>
                        <p><strong>Claude:</strong> https://claude.ai/favicon.ico</p>
                        <p><strong>Midjourney:</strong> https://www.midjourney.com/favicon.ico</p>
                    </div>
                </div>
            </div>
            
            <div class="mt-6 flex justify-end">
                <button onclick="this.closest('.fixed').remove()" 
                        class="bg-ai-blue text-white px-4 py-2 rounded-lg hover:bg-ai-purple transition-colors">
                    확인
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// 인기 AI 서비스 파비콘 목록 (참고용)
const popularAIFavicons = {
    'chat.openai.com': 'https://chat.openai.com/favicon.ico',
    'claude.ai': 'https://claude.ai/favicon.ico',
    'bard.google.com': 'https://bard.google.com/favicon.ico',
    'www.midjourney.com': 'https://www.midjourney.com/favicon.ico',
    'labs.openai.com': 'https://labs.openai.com/favicon.ico',
    'beta.openai.com': 'https://beta.openai.com/favicon.ico',
    'stability.ai': 'https://stability.ai/favicon.ico',
    'huggingface.co': 'https://huggingface.co/favicon.ico',
    'github.com': 'https://github.com/favicon.ico',
    'colab.research.google.com': 'https://colab.research.google.com/favicon.ico'
};

// 구독 정보 필드 토글
function toggleSubscriptionFields() {
    const status = document.getElementById('subscription-status').value;
    const paidFields = document.getElementById('paid-subscription-fields');
    
    if (status === 'paid' || status === 'trial') {
        paidFields.classList.remove('hidden');
    } else {
        paidFields.classList.add('hidden');
    }
}

// 구독 정보 모달 표시
function showSubscriptionModal(appId) {
    // 앱 정보 가져오기
    fetch(`tables/ai_apps/${appId}`)
        .then(response => response.json())
        .then(app => {
            const content = document.getElementById('subscription-content');
            content.innerHTML = generateSubscriptionContent(app);
            document.getElementById('subscription-modal').classList.remove('hidden');
        })
        .catch(error => {
            console.error('구독 정보 로드 오류:', error);
            showErrorMessage('구독 정보를 불러오는데 실패했습니다.');
        });
}

// 구독 정보 콘텐츠 생성
function generateSubscriptionContent(app) {
    const status = app.subscription_status || 'free';
    
    if (status === 'free') {
        return `
            <div class="text-center py-4">
                <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-gift text-green-500 text-2xl"></i>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">${app.name}</h3>
                <p class="text-green-600 font-medium">🆓 무료 서비스</p>
                <p class="text-gray-500 text-sm mt-2">이 앱은 무료로 사용 중입니다.</p>
            </div>
        `;
    }
    
    const isExpiringSoon = checkExpirationStatus(app.next_billing_date);
    const nextBilling = app.next_billing_date ? new Date(app.next_billing_date).toLocaleDateString('ko-KR') : '-';
    const startDate = app.subscription_start_date ? new Date(app.subscription_start_date).toLocaleDateString('ko-KR') : '-';
    const monthlyPrice = app.subscription_price || 0;
    const yearlyPrice = app.billing_cycle === 'yearly' ? monthlyPrice : monthlyPrice * 12;
    
    return `
        <div class="space-y-4">
            <div class="text-center">
                <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i class="fas fa-crown text-blue-500 text-2xl"></i>
                </div>
                <h3 class="text-lg font-semibold text-gray-900">${app.name}</h3>
                <p class="text-blue-600 font-medium">${app.subscription_plan || 'Pro Plan'}</p>
            </div>
            
            <div class="bg-gray-50 rounded-lg p-4 space-y-3">
                <div class="flex justify-between items-center">
                    <span class="text-gray-600">💰 월 요금</span>
                    <span class="font-semibold text-gray-900">$${monthlyPrice.toFixed(2)}</span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-gray-600">🔄 결제 주기</span>
                    <span class="font-medium text-gray-900">${app.billing_cycle === 'yearly' ? '연간' : '월간'}</span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-gray-600">📅 다음 결제일</span>
                    <span class="font-medium ${isExpiringSoon ? 'text-red-600' : 'text-gray-900'}">
                        ${nextBilling}
                        ${isExpiringSoon ? ' ⚠️' : ''}
                    </span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-gray-600">🚀 구독 시작일</span>
                    <span class="font-medium text-gray-900">${startDate}</span>
                </div>
            </div>
            
            ${app.billing_cycle === 'monthly' ? `
            <div class="bg-green-50 rounded-lg p-3 border border-green-200">
                <p class="text-green-800 text-sm">
                    💡 <strong>절약 팁:</strong> 연간 구독 시 약 $${(yearlyPrice * 0.2).toFixed(2)} 절약 가능!
                </p>
            </div>
            ` : ''}
            
            ${isExpiringSoon ? `
            <div class="bg-red-50 rounded-lg p-3 border border-red-200">
                <p class="text-red-800 text-sm">
                    ⚠️ <strong>알림:</strong> 구독이 곧 만료됩니다. 갱신을 확인해 주세요.
                </p>
            </div>
            ` : ''}
            
            <div class="flex space-x-2 pt-2">
                <button onclick="openApp('${app.id}', '${app.url}')" 
                        class="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
                    앱 실행
                </button>
                <button onclick="editApp('${app.id}')" 
                        class="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors">
                    정보 수정
                </button>
            </div>
        </div>
    `;
}

// 만료 임박 확인
function checkExpirationStatus(nextBillingDate) {
    if (!nextBillingDate) return false;
    
    const today = new Date();
    const billingDate = new Date(nextBillingDate);
    const daysDiff = Math.ceil((billingDate - today) / (1000 * 60 * 60 * 24));
    
    return daysDiff <= 7; // 7일 이내 만료
}

// 구독 정보 모달 닫기
function closeSubscriptionModal() {
    document.getElementById('subscription-modal').classList.add('hidden');
}

// 디바운스 함수
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 편집 모달 구독 정보 로딩
function loadEditSubscriptionInfo(app) {
    // 구독 상태 설정
    const statusSelect = document.getElementById('edit-subscription-status');
    statusSelect.value = app.subscription_status || 'free';
    
    // 구독 필드들 로딩
    document.getElementById('edit-subscription-plan').value = app.subscription_plan || '';
    document.getElementById('edit-subscription-price').value = app.subscription_price || '';
    document.getElementById('edit-billing-cycle').value = app.billing_cycle || 'monthly';
    
    // 날짜 필드들 로딩 (YYYY-MM-DD 형식으로 변환)
    if (app.subscription_start_date) {
        const startDate = new Date(app.subscription_start_date);
        document.getElementById('edit-subscription-start-date').value = startDate.toISOString().split('T')[0];
        document.getElementById('edit-trial-start-date').value = startDate.toISOString().split('T')[0];
    }
    
    if (app.next_billing_date) {
        const nextDate = new Date(app.next_billing_date);
        document.getElementById('edit-next-billing-date').value = nextDate.toISOString().split('T')[0];
        document.getElementById('edit-trial-end-date').value = nextDate.toISOString().split('T')[0];
    }
    
    // 구독 필드 표시/숨김 설정
    toggleEditSubscriptionFields();
}

// 편집 모달 구독 필드 토글
function toggleEditSubscriptionFields() {
    const status = document.getElementById('edit-subscription-status').value;
    const paidFields = document.getElementById('edit-paid-subscription-fields');
    const trialFields = document.getElementById('edit-trial-subscription-fields');
    
    // 모든 필드 숨김
    paidFields.classList.add('hidden');
    trialFields.classList.add('hidden');
    
    if (status === 'paid') {
        paidFields.classList.remove('hidden');
    } else if (status === 'trial') {
        trialFields.classList.remove('hidden');
    }
}

// 편집 모달 구독 데이터 수집
function collectEditSubscriptionData(formData) {
    const subscriptionStatus = formData.get('subscription_status') || 'free';
    
    const subscriptionData = {
        subscription_status: subscriptionStatus
    };
    
    if (subscriptionStatus === 'free') {
        // 무료일 때는 구독 관련 필드들을 null로 설정
        subscriptionData.subscription_plan = null;
        subscriptionData.subscription_price = null;
        subscriptionData.billing_cycle = null;
        subscriptionData.subscription_start_date = null;
        subscriptionData.next_billing_date = null;
    } else if (subscriptionStatus === 'paid') {
        // 유료 구독 정보
        subscriptionData.subscription_plan = formData.get('subscription_plan') || null;
        subscriptionData.subscription_price = formData.get('subscription_price') ? parseFloat(formData.get('subscription_price')) : null;
        subscriptionData.billing_cycle = formData.get('billing_cycle') || 'monthly';
        subscriptionData.subscription_start_date = formData.get('subscription_start_date') || null;
        subscriptionData.next_billing_date = formData.get('next_billing_date') || null;
    } else if (subscriptionStatus === 'trial') {
        // 무료체험 정보
        subscriptionData.subscription_plan = 'Trial';
        subscriptionData.subscription_price = null;
        subscriptionData.billing_cycle = 'trial';
        subscriptionData.subscription_start_date = formData.get('subscription_start_date') || null;
        subscriptionData.next_billing_date = formData.get('next_billing_date') || null; // 체험 종료일
    }
    
    return subscriptionData;
}













