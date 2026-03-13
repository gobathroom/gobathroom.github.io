document.addEventListener('DOMContentLoaded', () => {
  const htmlLangRaw = (document.documentElement.lang || 'en').toLowerCase();
  const langBase = htmlLangRaw.split('-')[0];
  const lang = (langBase === 'en' || langBase === 'es') ? langBase : 'en';

  const noticesByLang = window.NOTICES || {};
  let noticesData = noticesByLang[lang];

  if (!Array.isArray(noticesData) || !noticesData.length) {
    noticesData = noticesByLang.en;
  }
  if (!Array.isArray(noticesData) || !noticesData.length) {
    return;
  }

  const hasI18n = window.GB_I18N && typeof window.GB_I18N.t === 'function';
  const notifastStrings = {
    lawLabel:  hasI18n ? window.GB_I18N.t('notifast.lawLabel')  : 'Quick law',
    tipLabel:  hasI18n ? window.GB_I18N.t('notifast.tipLabel')  : 'Quick tip',
    moreLabel: hasI18n ? window.GB_I18N.t('notifast.moreLabel') : 'Read more',
    prevLabel: hasI18n ? window.GB_I18N.t('notifast.prevLabel') : 'Previous notice',
    nextLabel: hasI18n ? window.GB_I18N.t('notifast.nextLabel') : 'Next notice',
    openLabel: hasI18n ? window.GB_I18N.t('notifast.openLabel') : 'Open notice'
  };

  const DEFAULT_DELAY = 8000;
  const MANUAL_DELAY = 15000;

  const mainEl = document.getElementById('notifMain');
  const textInnerEl = document.getElementById('notifTextInner');
  const msgEl = document.getElementById('notifMessage');
  const labelEl = document.getElementById('notifLabel');
  const iconEl = document.getElementById('notifIcon');
  const pillEl = document.getElementById('notifPill');
  const moreEl = document.getElementById('notifMore');
  const prevBtn = document.getElementById('notifPrev');
  const nextBtn = document.getElementById('notifNext');

  if (!mainEl || !textInnerEl || !msgEl || !labelEl || !iconEl || !pillEl || !moreEl || !prevBtn || !nextBtn) {
    return;
  }

  prevBtn.setAttribute('aria-label', notifastStrings.prevLabel);
  nextBtn.setAttribute('aria-label', notifastStrings.nextLabel);

  let currentIndex = 0;
  let timerId = null;
  let activeUrl = null;

  function buildBalancedSequence(items) {
    const laws = items.filter(item => item.kind === 'law');
    const others = items.filter(item => item.kind !== 'law');

    if (!laws.length) return [...others];
    if (!others.length) return [...laws];

    const ratio = others.length >= laws.length * 3 ? 2 : 1;
    const sequence = [];

    let lawIndex = 0;
    let otherIndex = 0;
    let useLaw = true;

    while (sequence.length < items.length) {
      if (useLaw) {
        if (laws.length) {
          sequence.push(laws[lawIndex % laws.length]);
          lawIndex++;
        }
        useLaw = false;
      } else {
        for (let i = 0; i < ratio && sequence.length < items.length; i++) {
          if (others.length) {
            sequence.push(others[otherIndex % others.length]);
            otherIndex++;
          }
        }
        useLaw = true;
      }

      if (sequence.length >= items.length) break;
    }

    return sequence.slice(0, items.length);
  }

  const notices = buildBalancedSequence(noticesData);

  function scheduleNext(delay) {
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      goNext(false);
    }, delay);
  }

  function applyClickableState(item) {
    const isLaw = item.kind === 'law' && !!item.moreUrl;
    activeUrl = isLaw ? item.moreUrl : null;

    mainEl.classList.toggle('is-clickable', isLaw);

    if (isLaw) {
      mainEl.setAttribute('tabindex', '0');
      mainEl.setAttribute('aria-label', notifastStrings.openLabel);
      moreEl.textContent = notifastStrings.moreLabel;
    } else {
      mainEl.setAttribute('tabindex', '-1');
      mainEl.removeAttribute('aria-label');
    }
  }

  function renderNotice() {
    const current = notices[currentIndex];
    if (!current) return;

    const isLaw = current.kind === 'law';

    msgEl.textContent = current.text;
    labelEl.textContent = (isLaw ? notifastStrings.lawLabel : notifastStrings.tipLabel) + ':';

    iconEl.className = 'fas ' + (isLaw ? 'fa-gavel' : 'fa-bolt');
    pillEl.classList.toggle('notifbar-pill--law', isLaw);
    pillEl.classList.toggle('notifbar-pill--tip', !isLaw);

    applyClickableState(current);
  }

  function animateChange(direction, updateIndexFn, fromUser) {
    const outClass = direction === 'next' ? 'notif-slide-out-next' : 'notif-slide-out-prev';
    const inClass = direction === 'next' ? 'notif-slide-in-next' : 'notif-slide-in-prev';

    textInnerEl.classList.remove(
      'notif-slide-out-next',
      'notif-slide-in-next',
      'notif-slide-out-prev',
      'notif-slide-in-prev'
    );

    textInnerEl.classList.add(outClass);

    function handleOutEnd() {
      textInnerEl.removeEventListener('animationend', handleOutEnd);
      textInnerEl.classList.remove(outClass);

      updateIndexFn();
      renderNotice();

      textInnerEl.classList.add(inClass);

      function handleInEnd() {
        textInnerEl.removeEventListener('animationend', handleInEnd);
        textInnerEl.classList.remove(inClass);
      }

      textInnerEl.addEventListener('animationend', handleInEnd);
    }

    textInnerEl.addEventListener('animationend', handleOutEnd);
    scheduleNext(fromUser ? MANUAL_DELAY : DEFAULT_DELAY);
  }

  function goNext(fromUser) {
    animateChange(
      'next',
      () => {
        currentIndex = (currentIndex + 1) % notices.length;
      },
      fromUser
    );
  }

  function goPrev(fromUser = true) {
    animateChange(
      'prev',
      () => {
        currentIndex = (currentIndex - 1 + notices.length) % notices.length;
      },
      fromUser
    );
  }

  function openActiveLaw() {
    if (activeUrl) {
      window.open(activeUrl, '_blank', 'noopener,noreferrer');
    }
  }

  mainEl.addEventListener('click', () => {
    openActiveLaw();
  });

  mainEl.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && activeUrl) {
      e.preventDefault();
      openActiveLaw();
    }
  });

  prevBtn.addEventListener('click', () => {
    goPrev(true);
  });

  nextBtn.addEventListener('click', () => {
    goNext(true);
  });

  renderNotice();
  scheduleNext(DEFAULT_DELAY);
});
