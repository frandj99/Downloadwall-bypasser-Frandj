// ==UserScript==
// @name         Hypeddit DownloadWallBypasser Reloaded
// @namespace    https://github.com/frandj99/Downloadwall-bypasser-Frandj
// @version      2026.10.15
// @description  Bypass Hypeddit, PumpYourSound, and Droploud download fangates automatically. Soundcloud and Spotify accounts are mandatory!
// @author       fan1200, frandj99
// @match        *://hypeddit.com/*
// @match        *://*.hypeddit.com/*
// @match        *://pumpyoursound.com/*
// @match        *://*.pumpyoursound.com/*
// @match        *://droploud.com/*
// @match        *://*.droploud.com/*
// @match        *://soundcloud.com/*
// @match        *://*.soundcloud.com/*
// @match        *://secure.soundcloud.com/connect*
// @match        *://secure.soundcloud.com/authorize*
// @match        *://*.instagram.com/*
// @match        *://instagram.com/*
// @match        *://accounts.spotify.com/*
// @match        *://open.spotify.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=hypeddit.com
// @downloadURL  https://raw.githubusercontent.com/frandj99/Downloadwall-bypasser-Frandj/master/script.user.js
// @updateURL    https://raw.githubusercontent.com/frandj99/Downloadwall-bypasser-Frandj/master/script.user.js
// @grant        unsafeWindow
// @grant        window.close
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// ==/UserScript==

;(function () {
    "use strict"

    const defaultSettings = {
        email: "musicfan@example.com",
        name: "Music Lover",
        comment: "Woow! Thanks bro",
        auto_close: false,
        auto_close_timeout_in_ms: 10000,
    };

    const getStored = (key, fallback) => {
        try {
            if (typeof GM_getValue !== "undefined") {
                return GM_getValue(key, fallback);
            }
        } catch (e) {}
        return fallback;
    };

    const setStored = (key, val) => {
        try {
            if (typeof GM_setValue !== "undefined") {
                GM_setValue(key, val);
            }
        } catch (e) {}
    };

    // Register Tampermonkey extension menu commands for easy configuration without editing code
    if (typeof GM_registerMenuCommand !== "undefined") {
        GM_registerMenuCommand("⚙️ Set Email Address", () => {
            const current = getStored("hypeddit_email", defaultSettings.email);
            const val = prompt("Enter your email for download gates:", current);
            if (val !== null && val.trim() !== "") {
                setStored("hypeddit_email", val.trim());
                window.hypedditSettings.email = val.trim();
                alert("Email saved: " + val.trim());
            }
        });

        GM_registerMenuCommand("⚙️ Set Name", () => {
            const current = getStored("hypeddit_name", defaultSettings.name);
            const val = prompt("Enter your display name for download gates:", current);
            if (val !== null && val.trim() !== "") {
                setStored("hypeddit_name", val.trim());
                window.hypedditSettings.name = val.trim();
                alert("Name saved: " + val.trim());
            }
        });

        GM_registerMenuCommand("⚙️ Set SoundCloud Comment", () => {
            const current = getStored("hypeddit_comment", defaultSettings.comment);
            const val = prompt("Enter your default SoundCloud comment:", current);
            if (val !== null && val.trim() !== "") {
                setStored("hypeddit_comment", val.trim());
                window.hypedditSettings.comment = val.trim();
                alert("Comment saved: " + val.trim());
            }
        });
    }

    window.hypedditSettings = {
        email: getStored("hypeddit_email", defaultSettings.email),
        name: getStored("hypeddit_name", defaultSettings.name),
        comment: getStored("hypeddit_comment", defaultSettings.comment),
        auto_close: getStored("hypeddit_auto_close", defaultSettings.auto_close),
        auto_close_timeout_in_ms: getStored("hypeddit_auto_close_timeout_in_ms", defaultSettings.auto_close_timeout_in_ms),
    };

    if (window.location.host.includes("instagram.com")) {
        console.log("Instagram handler start");
        // Automatically close non-required Instagram tabs opened by fangates after a brief delay
        if (window.opener !== null || document.referrer.match(/(droploud|hypeddit|pumpyoursound)/i)) {
            console.info("Fangate Instagram tab detected. Auto-closing in 2.5 seconds...");
            setTimeout(function () {
                window.close();
            }, 2500);
        }
        return;
    }

    if (window.location.host.includes("spotify.com")) {
        const tryAuthorizeSpotify = () => {
            const agreeBtn = document.querySelector('[data-testid="auth-accept"], button#auth-accept, button[value="agree"], button.btn-primary');
            if (agreeBtn && !window.hasClickedSpotifyAuth) {
                window.hasClickedSpotifyAuth = true;
                console.info("Clicking Spotify Authorize button");
                agreeBtn.click();
            }
        };
        tryAuthorizeSpotify();
        setInterval(tryAuthorizeSpotify, 400);

        if (window.opener !== null && (document.referrer.match(/(droploud|hypeddit|pumpyoursound)/i) || window.location.href.includes("flow_ctx="))) {
            setTimeout(function () {
                window.close();
            }, 3000);
        }
        return;
    }

    if (window.location.host.includes("droploud.com")) {
        console.log("Droploud handler start");

        const uWindow = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;

        // Auto-close non-repost popup tabs opened by Droploud after 2.5 seconds
        if (!uWindow.__hasOverriddenOpen) {
            uWindow.__hasOverriddenOpen = true;
            const originalOpen = uWindow.open;
            uWindow.open = function (...args) {
                const targetUrl = args[0] ? String(args[0]) : "";
                console.info("Droploud window.open intercepted:", targetUrl);

                const isScTrack = targetUrl.includes("soundcloud.com") &&
                                  !targetUrl.includes("/connect") &&
                                  !targetUrl.includes("/authorize");

                if (isScTrack) {
                    setStored("fangate_repost_time", Date.now());
                    setStored("fangate_repost_track", targetUrl);
                    try {
                        const parsed = new URL(targetUrl, window.location.href);
                        parsed.hash = "fangate_repost";
                        args[0] = parsed.toString();
                    } catch(e) {}
                }

                try {
                    const win = originalOpen.apply(this, args);
                    if (win) {
                        // For generic social popups (Instagram etc.), auto-close after 2.5s.
                        // For SoundCloud track reshare pages, keep tab open so it can be reposted!
                        if (!isScTrack) {
                            setTimeout(() => {
                                try { win.close(); } catch(e) {}
                            }, 2500);
                        }
                        return win;
                    }
                } catch(e) {}
                return { close: function() {} };
            };
        }

        const simulateTyping = function (element, text) {
            if (!element) return;
            element.focus();

            const proto = element instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
            const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;

            // Reset _valueTracker so React's change detection recognizes the value modification
            if (element._valueTracker) {
                element._valueTracker.setValue('');
            }

            if (nativeSetter) {
                nativeSetter.call(element, text);
            } else {
                element.value = text;
            }

            // Dispatch full chain of keyboard and input events to emulate realistic user typing
            element.dispatchEvent(new Event('focus', { bubbles: true }));
            element.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: text.slice(-1) }));
            element.dispatchEvent(new KeyboardEvent('keypress', { bubbles: true, cancelable: true, key: text.slice(-1) }));
            element.dispatchEvent(new InputEvent('beforeinput', { bubbles: true, cancelable: true, inputType: 'insertText', data: text }));
            element.dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: true, inputType: 'insertText', data: text }));
            element.dispatchEvent(new Event('input', { bubbles: true }));
            element.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, cancelable: true, key: text.slice(-1) }));
            element.dispatchEvent(new Event('change', { bubbles: true }));
            element.dispatchEvent(new Event('blur', { bubbles: true }));
        };

        const handleDroploud = function () {
            if (performance.now() < 800) return;
            const now = Date.now();
            const activeContainer = document.querySelector('.dtr-stage, .dtr-card-pane, .dtr-track-info');

            // 1. Initial "FREE DOWNLOAD" button
            const freeDlBtn = Array.from(document.querySelectorAll('button')).find(btn =>
                btn.textContent.toUpperCase().includes("FREE DOWNLOAD") && !btn.disabled && !btn.dataset.autoClicked
            );
            if (freeDlBtn) {
                freeDlBtn.dataset.autoClicked = "true";
                console.info("Clicking FREE DOWNLOAD");
                freeDlBtn.click();
                return;
            }

            // 2. Email step handling
            const emailInput = document.querySelector('.dtr-stage input[type="email"], .dtr-card-pane input[type="email"], input[type="email"]');
            if (emailInput && (emailInput.value !== window.hypedditSettings.email || !emailInput.dataset.typed)) {
                emailInput.dataset.typed = "true";
                console.info("Simulating typing for Droploud email");
                simulateTyping(emailInput, window.hypedditSettings.email);
            }

            const consentCheckbox = document.querySelector('.dtr-stage input[type="checkbox"]:not(:checked), .dtr-card-pane input[type="checkbox"]:not(:checked)');
            if (consentCheckbox) {
                console.info("Checking consent checkbox");
                consentCheckbox.click();
            }

            const emailContinueBtn = Array.from(document.querySelectorAll('.dtr-stage button, .dtr-card-pane button')).find(btn => {
                const txt = (btn.textContent || "").trim().toLowerCase();
                return (txt.includes("continue") || txt.includes("next")) && !btn.disabled && !btn.dataset.emailContinueClicked;
            });
            if (emailInput && emailInput.value && emailContinueBtn) {
                emailContinueBtn.dataset.emailContinueClicked = "true";
                console.info("Clicking email Continue button");
                emailContinueBtn.click();
                return;
            }

            // 3. Social buttons (Instagram / SoundCloud / Spotify) strictly scoped to active card
            if (activeContainer) {
                const socialButtons = Array.from(activeContainer.querySelectorAll('button, a')).filter(el => {
                    const href = (el.getAttribute('href') || el.href || "").toLowerCase();
                    // Prevent clicking internal site navigation like creator cards / promo / nav links
                    if (href.startsWith('/') || href.includes('droploud.com/creator') || href.includes('droploud.com/u/') || href.startsWith('mailto:')) return false;
                    const txt = (el.textContent || "").trim().toLowerCase();
                    if (txt.includes("open track on soundcloud") || txt.includes("reshare") || txt.includes("repost") || txt.includes("free download") || txt.includes("terms") || txt.includes("dmca")) return false;

                    return (txt.includes("↗") || txt.includes("@") || href.includes("instagram.com") || href.includes("spotify.com") || href.includes("soundcloud.com")) &&
                        !el.dataset.autoClicked && !el.disabled;
                });

                socialButtons.forEach(el => {
                    el.dataset.autoClicked = "true";
                    console.info("Triggering social link:", el.textContent.trim());
                    try { el.click(); } catch(e) {}
                });

                const confirmBtn = Array.from(activeContainer.querySelectorAll('button')).find(btn =>
                    (btn.textContent.includes("I did it") || btn.textContent.includes("I'm done") || btn.textContent.includes("Done")) && !btn.disabled && !btn.dataset.autoClicked
                );
                if (confirmBtn) {
                    confirmBtn.dataset.autoClicked = "true";
                    console.info("Clicking 'I did it' button");
                    confirmBtn.click();
                    return;
                }
            }

            // 4. SoundCloud step (with realistic comment typing emulation and track repost handling)
            const commentInput = document.querySelector('#dtr-sc-comment-input, textarea.ds-input, textarea[placeholder*="comment"], textarea');
            const charCounter = Array.from(document.querySelectorAll('div, span, p')).find(el => /^\s*0\s*\/\s*\d+\s*$/.test(el.textContent));
            const needsTyping = commentInput && (commentInput.value !== window.hypedditSettings.comment || !charCounter || !commentInput.dataset.typed);

            if (needsTyping) {
                commentInput.dataset.typed = "true";
                console.info("Simulating typing for comment input");
                simulateTyping(commentInput, window.hypedditSettings.comment);
            }

            const connectScBtn = Array.from(document.querySelectorAll('.dtr-stage button, .dtr-card-pane button, button')).find(btn =>
                btn.textContent.includes("Connect SoundCloud") && !btn.disabled
            );
            if (connectScBtn) {
                if (!window.lastConnectScClick || now - window.lastConnectScClick > 5000) {
                    window.lastConnectScClick = now;
                    console.info("Clicking Connect SoundCloud");
                    connectScBtn.click();
                    return;
                }
            }

            const openScTrackBtn = Array.from(document.querySelectorAll('.dtr-stage button, .dtr-stage a, .dtr-card-pane button, .dtr-card-pane a, button, a')).find(btn => {
                const txt = (btn.textContent || "").trim().toLowerCase();
                const href = (btn.getAttribute('href') || btn.href || "").toLowerCase();
                const isScTrack = href.includes("soundcloud.com") && !href.includes("/connect") && !href.includes("/authorize");
                const isReshareText = txt.includes("open track on soundcloud") ||
                                      txt.includes("open on soundcloud") ||
                                      txt.includes("reshare") ||
                                      txt.includes("repost") ||
                                      txt.includes("share track");
                return (isReshareText || isScTrack) &&
                       !txt.includes("verify") && !txt.includes("reposted") && !txt.includes("reshared") && !txt.includes("connect soundcloud") && !btn.disabled;
            });

            if (openScTrackBtn) {
                const repostDone = getStored("fangate_repost_completed", 0);
                if (!window.lastOpenedScTrack || (now - window.lastOpenedScTrack > 15000 && !repostDone)) {
                    window.lastOpenedScTrack = now;
                    setStored("fangate_repost_time", Date.now());
                    if (openScTrackBtn.href && openScTrackBtn.href.includes("soundcloud.com")) {
                        setStored("fangate_repost_track", openScTrackBtn.href);
                        try {
                            const u = new URL(openScTrackBtn.href, window.location.href);
                            u.hash = "fangate_repost";
                            openScTrackBtn.href = u.toString();
                        } catch(e) {}
                    }
                    console.info("Clicking Open track on SoundCloud / Reshare button:", openScTrackBtn.textContent.trim());
                    try { openScTrackBtn.click(); } catch(e) {}
                }
            }

            const verifyRepostBtn = Array.from(document.querySelectorAll('.dtr-stage button, .dtr-card-pane button, button')).find(btn => {
                const txt = (btn.textContent || "").trim().toLowerCase();
                return (txt.includes("verify") || txt.includes("reposted") || txt.includes("reshared") || txt.includes("i've reposted") || txt.includes("i've reshared") || txt.includes("check repost")) && !btn.disabled;
            });
            if (verifyRepostBtn) {
                const repostDone = getStored("fangate_repost_completed", 0);
                const interval = repostDone ? 2000 : 3500;
                if (!window.lastVerifyClick || now - window.lastVerifyClick > interval) {
                    window.lastVerifyClick = now;
                    console.info("Clicking Verify Repost");
                    verifyRepostBtn.click();
                    return;
                }
            }

            // 5. Spotify step
            const connectSpotifyBtn = Array.from(document.querySelectorAll('.dtr-stage button, .dtr-card-pane button, button')).find(btn =>
                (btn.textContent.toLowerCase().includes("connect spotify") || btn.textContent.toLowerCase().includes("follow on spotify") || btn.textContent.toLowerCase().includes("spotify connect")) && !btn.disabled
            );
            if (connectSpotifyBtn) {
                if (!window.lastConnectSpotifyClick || now - window.lastConnectSpotifyClick > 5000) {
                    window.lastConnectSpotifyClick = now;
                    console.info("Clicking Connect Spotify");
                    connectSpotifyBtn.click();
                    return;
                }
            }

            // 6. Generic Continue / Follow / Skip
            const generalContinueBtn = Array.from(document.querySelectorAll('.dtr-stage button, .dtr-card-pane button')).find(btn => {
                const txt = (btn.textContent || "").trim().toLowerCase();
                return (txt.includes("continue") || txt.includes("i'm done") || txt.includes("follow on droploud") || txt.includes("skip")) && !btn.disabled && !btn.dataset.autoClicked;
            });
            if (generalContinueBtn) {
                generalContinueBtn.dataset.autoClicked = "true";
                console.info("Clicking Droploud Continue/Skip/Follow step:", generalContinueBtn.textContent.trim());
                generalContinueBtn.click();
                return;
            }

            // 7. Final DOWNLOAD button when unlocked
            const finalDownloadBtn = Array.from(document.querySelectorAll('.dtr-stage button, .dtr-stage a, .dtr-card-pane button, .dtr-card-pane a, button, a')).find(btn => {
                const txt = (btn.textContent || "").trim().toLowerCase();
                const href = (btn.getAttribute('href') || "").toLowerCase();
                return (txt === "download" || txt === "download file" || txt.includes("download now") || href.includes("/api/download") || href.includes("r2.dev") || href.includes("drive.google")) && !btn.disabled && !btn.classList.contains("ds-free-dl");
            });
            if (finalDownloadBtn && !window.hasClickedFinalDownload) {
                window.hasClickedFinalDownload = true;
                console.info("Clicking Final DOWNLOAD button");
                finalDownloadBtn.click();

                if (window.hypedditSettings.auto_close) {
                    const timeout = window.hypedditSettings.auto_close_timeout_in_ms;
                    setTimeout(function () {
                        window.close();
                    }, timeout);
                }
            }
        };

        setInterval(handleDroploud, 500);
        const observer = new MutationObserver(handleDroploud);
        if (document.body) {
            observer.observe(document.body, { childList: true, subtree: true, attributes: true });
        }
        return;
    }

    if (window.location.host.includes("pumpyoursound.com")) {
        console.log("Pumpyoursound handler start");
        const uri = new URL(location.href);
        const uWindow = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;

        const pumpUrSoundHandler = function () {
            const steps = document.querySelectorAll('.fanpageDownload__item');
            let countStepDone = 0;
            const SC = uWindow.SC;
            const $ = uWindow.$;

            if (!Object.prototype.hasOwnProperty.call(window, 'isPumpHandled')) {
                window.isPumpHandled = false;
            }

            function simulateConnectUsingSdk() {
                try {
                    if (localStorage.getItem('scConnDialog')) {
                        return;
                    }
                    localStorage.removeItem('isPumpConnectDone');
                    const j = SC.connect(callbackForSc);
                    localStorage.setItem('scConnDialog', j.id);
                    return j;
                } catch (e) {
                    setTimeout(simulateConnectUsingSdk, 300);
                    return null;
                }
            }

            function callbackForSc() {
                console.info('on callback for connect', this, arguments);
                const doneCond = localStorage.getItem('isPumpConnectDone');
                console.info('check connect done in callback', doneCond);

                if (!doneCond) {
                    setTimeout(callbackForSc, 300);
                    return;
                }

                if (doneCond) {
                    const t = document.querySelector('[data-href]');
                    if (!t) return;
                    let accessToken;
                    const baseUrl = window.location.origin;

                    fetch(`${baseUrl}/?do=mySoundcloudAccessToken`, {
                        method: 'GET',
                        headers: { 'X-Requested-With': 'XMLHttpRequest' }
                    })
                    .then(response => response.text())
                    .then(data => {
                        console.info('response data', data);
                        try {
                            data = JSON.parse(data);
                        } catch (e) {
                            console.error('Error in parsing response data:', e);
                        }
                        accessToken = data.accessToken || '';

                        const urlGet = t.dataset.href;
                        const fullUrlGet = urlGet.startsWith('http') ? urlGet : `${baseUrl}${urlGet.startsWith('/') ? '' : '/'}${urlGet}`;
                        const urlParts = fullUrlGet.split('?');
                        const urlBase = urlParts[0];
                        const params = new URLSearchParams(urlParts.length > 1 ? urlParts[1] : '');

                        params.set('accessToken', accessToken);
                        params.set('text', window.hypedditSettings.comment);

                        return fetch(`${urlBase}?${params.toString()}`, {
                            method: 'GET',
                            headers: { 'X-Requested-With': 'XMLHttpRequest' }
                        });
                    })
                    .then(data => {
                        console.info('done');
                        data.text().then(text => { console.error(text); });
                        setTimeout(() => window.location.reload(), 1000);
                    })
                    .catch(error => {
                        console.error('Error in fetch operation:', error);
                    })
                    .finally(() => {
                        localStorage.removeItem('isPumpConnectDone');
                    });
                }
            }

            function alternateMethodForPump() {
                console.warn('Run alternateMethodForPump');
                clearLocalStoredVals();
                simulateConnectUsingSdk();
                const itvId = window.setInterval(() => {
                    const doneCond = localStorage.getItem('isPumpConnectDone');
                    if (doneCond) {
                        console.info('call connect callback');
                        callbackForSc();
                        clearInterval(itvId);
                        console.info('interval stopped', doneCond);
                    }
                }, 500);
            }

            function clearLocalStoredVals() {
                localStorage.removeItem('scConnDialog');
                localStorage.removeItem('isPumpConnectDone');
            }

            steps.forEach((curEl) => {
                if (window.isPumpHandled) {
                    console.warn('Pump handled, abort');
                    return;
                }
                const curStep = curEl.querySelector('.fangateStep.state');
                if (!curStep) return;
                if (curStep.classList.contains('pull-left') || curStep.classList.contains('done')) {
                    countStepDone++;
                    return; // continue
                }
                if (!curStep.classList.contains('done')) {
                    const stepLabel = Array.from(curStep.classList)
                        .find(v => v.includes('fangateStep--'))
                        .replace('fangateStep--', '');
                    console.info('Processing pump step:', stepLabel);
                    switch (stepLabel) {
                        case 'soundcloud':
                            const trySoundcloud = () => {
                                if (!document.querySelector('#soundcloud-api') || !SC) {
                                    setTimeout(trySoundcloud, 300);
                                    return;
                                }
                                if (!localStorage.getItem('useAlternate')) {
                                    const btn = curEl.querySelector('.socBtn');
                                    if (btn) {
                                        btn.click();
                                        console.info('trigger click for ' + stepLabel);
                                    }
                                } else {
                                    alternateMethodForPump();
                                }
                            };
                            setTimeout(trySoundcloud, 300);
                            break;
                        case 'comment':
                            const commentPump = () => {
                                if (!document.querySelector('#soundcloud-api') || !SC) {
                                    setTimeout(commentPump, 300);
                                    console.info('no SC api, try in next 300 ms');
                                    return;
                                }
                                const commentInput = curEl.querySelector('input[name="fangate_comment"]');
                                if (commentInput) {
                                    commentInput.value = window.hypedditSettings.comment;
                                }
                                const btn = curEl.querySelector('.btn.fangatex__sendComment');
                                if (btn) {
                                    if (!localStorage.getItem('useAlternate')) {
                                        console.info('trigger Comment click for ' + stepLabel);
                                        btn.click();
                                    } else {
                                        alternateMethodForPump();
                                    }
                                }
                            };
                            setTimeout(commentPump, 300);
                            break;
                        default:
                            // Handle other social gates (instagram, youtube, spotify, facebook, mixcloud, etc.)
                            setTimeout(() => {
                                const btn = curEl.querySelector('.socBtn, a.ajax, .btn, a');
                                if (btn) {
                                    console.info('Handling other social gate via click and fetch:', stepLabel);
                                    const originalOpen = uWindow.open;
                                    uWindow.open = function() {
                                        console.log('Blocked popup:', arguments);
                                        return { close: function() {} };
                                    };
                                    btn.click();
                                    uWindow.open = originalOpen;

                                    // Trigger AJAX call manually to make sure it registers the action
                                    const hrefVal = btn.dataset.href || btn.getAttribute('href');
                                    if (hrefVal && hrefVal.startsWith('/') && !hrefVal.startsWith('//')) {
                                        fetch(window.location.origin + hrefVal, {
                                            headers: { 'X-Requested-With': 'XMLHttpRequest' }
                                        }).then(() => {
                                            console.info(`Fetched AJAX URL for step ${stepLabel}`);
                                            setTimeout(() => window.location.reload(), 1000);
                                        });
                                    }
                                }
                            }, 300);
                            break;
                    }
                    window.isPumpHandled = true;
                }
            });

            if (countStepDone === steps.length) {
                console.info('all steps done. Submit download form');
                const downloadForm = document.querySelector('#frm-freeDownloadForm');
                if (downloadForm) {
                    setTimeout(() => downloadForm.submit(), 1500);
                }
            }
        };

        if (uri.pathname.includes('/f/')) {
            let tryCount = 0;
            const maxTries = 300;
            const waitForSc = function () {
                const cookieBtn = document.getElementById('CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll');
                if (cookieBtn) {
                    console.info('Cookiebot banner found, auto-accepting...');
                    cookieBtn.click();
                }

                tryCount++;
                if (tryCount > maxTries) {
                    console.warn('SC SDK loading timed out.');
                    return;
                }
                if (!uWindow.SC) {
                    console.info('SC not ready yet, try in next 200 ms');
                    setTimeout(waitForSc, 200);
                } else {
                    pumpUrSoundHandler();
                }
            };
            setTimeout(waitForSc, 200);
        }

        if (uri.searchParams.has('do') && uri.searchParams.get('do') === 'soundConnectAuth') {
            const pumpConnectHandler = function () {
                if (uri.searchParams.has('state') && uri.searchParams.has('code')) {
                    console.info('pump connect close in 1.5 sec');
                    localStorage.setItem('isPumpConnectDone', '1');
                    setTimeout(window.close, 1500);
                }
            };
            console.info('Run pumpConnectHandler');
            pumpConnectHandler();
        }
        return;
    }

    if (window.location.host.includes("soundcloud.com")) {
        const isAuthPage = window.location.pathname.includes("/connect") ||
                           window.location.pathname.includes("/authorize") ||
                           window.location.host.includes("secure.soundcloud.com");

        if (isAuthPage) {
            const tryClickAuth = () => {
                if (window.hasClickedScAuth) return;

                const buttons = Array.from(document.querySelectorAll('button[type="submit"], input[type="submit"], button'));
                const authButton = buttons.find(btn => {
                    if (btn.closest('.headerSearch') || btn.closest('form[role="search"]') || btn.closest('.searchForm')) return false;
                    const txt = (btn.textContent || btn.value || "").trim().toLowerCase();
                    return txt.includes("connect") || txt.includes("authorize") || txt.includes("allow") || txt.includes("accept") || btn.classList.contains("sc-button-connect") || (btn.type === "submit" && !btn.classList.contains("headerSearch__submit"));
                });

                if (authButton) {
                    window.hasClickedScAuth = true;
                    console.info("Clicking SoundCloud authorize button:", authButton);
                    authButton.click();
                }
            };

            tryClickAuth();
            let retries = 0;
            const intervalId = setInterval(() => {
                retries++;
                if (window.hasClickedScAuth || retries > 15) {
                    clearInterval(intervalId);
                    return;
                }
                tryClickAuth();
            }, 300);
            return;
        }

        // Regular SoundCloud track page: check if opened from a fangate requesting reshare/repost
        const isFangateReferrer = !!(document.referrer && document.referrer.match(/(droploud|hypeddit|pumpyoursound)/i));
        const isFangateHash = window.location.hash.includes("fangate_repost");
        const lastRepostTime = getStored("fangate_repost_time", 0);
        const isRecentRepostRequest = (Date.now() - lastRepostTime) < 120000; // requested within last 2 minutes
        const shouldAutoRepost = isFangateHash || isFangateReferrer || isRecentRepostRequest;

        if (!shouldAutoRepost) return;

        console.info("SoundCloud track opened from fangate detected. Initiating auto-repost handler...");

        const findRepostButton = () => {
            const directBtn = document.querySelector('button.sc-button-repost, .sc-button-repost');
            if (directBtn) return directBtn;

            const candidates = Array.from(document.querySelectorAll('.soundActions button, .listenEngagement button, button.sc-button, button'));
            return candidates.find(btn => {
                if (btn.closest('.headerSearch') || btn.closest('.playControls')) return false;
                const title = (btn.getAttribute('title') || '').toLowerCase();
                const aria = (btn.getAttribute('aria-label') || '').toLowerCase();
                const txt = (btn.textContent || '').trim().toLowerCase();
                return title.includes("repost") || aria.includes("repost") || txt === "repost" || txt === "reposted";
            });
        };

        const tryRepostTrack = () => {
            if (window.hasHandledScRepost) return;

            const repostBtn = findRepostButton();
            if (!repostBtn) return;

            const isAlreadyReposted = repostBtn.classList.contains("sc-button-selected") ||
                                      (repostBtn.getAttribute('title') || '').toLowerCase().includes("reposted") ||
                                      (repostBtn.getAttribute('title') || '').toLowerCase().includes("remove") ||
                                      (repostBtn.getAttribute('aria-label') || '').toLowerCase().includes("remove");

            if (isAlreadyReposted) {
                window.hasHandledScRepost = true;
                console.info("Track is already reposted on SoundCloud profile!");
                setStored("fangate_repost_completed", Date.now());
                setStored("fangate_repost_time", 0);

                setTimeout(() => {
                    try { window.close(); } catch(e) {}
                }, 1500);
                return;
            }

            window.hasHandledScRepost = true;
            console.info("Clicking SoundCloud Repost button:", repostBtn);
            repostBtn.click();
            setStored("fangate_repost_completed", Date.now());
            setStored("fangate_repost_time", 0);

            // Give SoundCloud time to send the repost network request before closing the tab
            setTimeout(() => {
                try { window.close(); } catch(e) {}
            }, 2000);
        };

        tryRepostTrack();
        let repostRetries = 0;
        const repostInterval = setInterval(() => {
            repostRetries++;
            tryRepostTrack();
            if (window.hasHandledScRepost || repostRetries > 40) {
                clearInterval(repostInterval);
            }
        }, 300);

        const repostObserver = new MutationObserver(() => {
            tryRepostTrack();
            if (window.hasHandledScRepost) {
                repostObserver.disconnect();
            }
        });
        if (document.body) {
            repostObserver.observe(document.body, { childList: true, subtree: true });
        }
    }

    window.handleFollowOptions = function (containerElementId, skipperId) {
        const container = document.getElementById(containerElementId);
        if (container !== null) {
            container
                .querySelectorAll("a")
                .forEach((accountItem) => {
                    accountItem.classList.remove("undone");
                    accountItem.classList.add("done");
                });

            const skipper = document.getElementById(skipperId);
            if (skipper) skipper.click();

            const skipperChannel = document.getElementById(skipperId.replace("_next", "_channel"));
            if (skipperChannel) skipperChannel.click();
        }
    }

    window.handleSoundCloud = function () {
        console.log("SOUNDCLOUD")
        window.handleFollowOptions("soundcloud_status", "skipper_sc_next")
    }

    window.handleInstagram = function () {
        console.log("INSTA")
        window.handleFollowOptions("instagram_status", "skipper_ig_next")
    }

    window.handleYoutube = function () {
        console.log("YOUTUBE")
        window.handleFollowOptions("youtube_status", "skipper_yt_next")
    }

    window.handleSpotify = function () {
        console.log("SPOTIFY")
        document.getElementById("step_sp").querySelector("a").click()
    }

    window.handleDownload = function () {
        console.log("DOWNLOAD")
        document.getElementById("gateDownloadButton").click()

        if (window.hypedditSettings.auto_close) {
            const timeout = window.hypedditSettings.auto_close_timeout_in_ms
            window.setTimeout(function () {
                close()
            }, timeout)
        }
    }

    window.handleEmail = function () {
        const email = window.hypedditSettings.email
        const name = window.hypedditSettings.name

        if (document.getElementById("email_name") !== null) {
            document.getElementById("email_name").setAttribute("value", name)
        }

        if (document.getElementById("email_address") !== null) {
            document
                .getElementById("email_address")
                .setAttribute("value", email)
            document.getElementById("email_address").value = email
        }

        document.getElementById("email_to_downloads_next").click()
    }

    window.handleTikTok = function () {
        console.log("TIKTOK")
        window.handleFollowOptions("tiktok_status", "skipper_tk_next")
    }

    window.handleFacebook = function () {
        console.log("FACEBOOK")
        document.getElementById("fbCarouselSocialSection").click()
    }

    window.handleMultiPortal = function () {
        document.getElementById("step_email").previousElementSibling.click()
        window.handleEmail()
    }

    window.handleEmailSoundCloud = function () {
        document.getElementById("step_email").previousElementSibling.click()
        window.handleEmail()
    }

    window.handleSoundCloudYoutube = function () {
        document.getElementById("step_yt").previousElementSibling.click()
        window.handleYoutube()
    }

    window.handleDonate = function () {
        document.getElementById("step_dn").previousElementSibling.click()
        document.getElementById("donation_next").click()
    }

    window.handleMixcloud = function () {
        console.log("Mixcloud")
        document.getElementById("skipper_mc").click()
    }

    window.handleBandCamp = function() {
        document.getElementById("skipper_bc").click()
    }

    const targetNode = document.getElementById("myCarousel")

    if (targetNode) {
        const config = { attributes: true, childList: true, subtree: true }

        let prevStepContent = null
        const callback = (mutationList, observer) => {
            for (const mutation of mutationList) {
                if (mutation.type === "attributes") {
                    const stepContent = document.querySelector(
                        ".fangate-slider-content:not(.move-left)"
                    )

                    if (stepContent !== prevStepContent) {
                        const stepClassList = stepContent.classList

                        if (stepClassList.contains("sp|ig|email")) {
                            window.handleMultiPortal()
                        }

                        if (stepClassList.contains("email|sc")) {
                            window.handleEmailSoundCloud()
                        }

                        if (stepClassList.contains("sc|yt")) {
                            window.handleSoundCloudYoutube()
                        }

                        if (stepClassList.contains("dn")) {
                            window.handleDonate()
                        }

                        if (stepClassList.contains("sc")) {
                            window.handleSoundCloud()
                        }

                        if (stepClassList.contains("ig")) {
                            window.handleInstagram()
                        }

                        if (stepClassList.contains("dw")) {
                            window.handleDownload()
                        }

                        if (stepClassList.contains("yt")) {
                            window.handleYoutube()
                        }

                        if (stepClassList.contains("sp")) {
                            window.handleSpotify()
                        }

                        if (stepClassList.contains("email")) {
                            window.handleEmail()
                        }

                        if (stepClassList.contains("tk")) {
                            window.handleTikTok()
                        }

                        if (stepClassList.contains("fb")) {
                            window.handleFacebook()
                        }

                        if (stepClassList.contains("mc")) {
                            window.handleMixcloud()
                        }

                        if(stepClassList.contains("bc")) {
                           window.handleBandCamp()
                        }
                    }

                    prevStepContent = stepContent
                }
            }
        }

        const observer = new MutationObserver(callback)

        observer.observe(targetNode, config)
    }

    const _start = () => {
        if (document.getElementById("downloadProcess") !== null) {
            document.getElementById("downloadProcess").click()
        }
    }

    window.setTimeout(_start, 800)
})()