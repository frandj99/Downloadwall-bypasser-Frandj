// ==UserScript==
// @name         Hypeddit DownloadWallBypasser Reloaded
// @namespace    https://github.com/frandj99/Downloadwall-bypasser-Frandj
// @version      2026.11.05.2
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
// @match        *://*.twitter.com/*
// @match        *://twitter.com/*
// @match        *://*.x.com/*
// @match        *://x.com/*
// @match        *://*.tiktok.com/*
// @match        *://tiktok.com/*
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
// @grant        GM_openInTab
// ==/UserScript==

;(function () {
    "use strict"

    const defaultSettings = {
        email: "musicfan99@gmail.com",
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

    if (window.location.host.includes("instagram.com") ||
        window.location.host.includes("twitter.com") ||
        window.location.host.includes("x.com") ||
        window.location.host.includes("tiktok.com")) {
        console.log("Social tab handler start:", window.location.host);
        // Automatically close non-required social tabs opened by fangates after a brief delay
        const lastSocialTime = getStored("fangate_social_opened_time", 0);
        const isRecentSocial = (Date.now() - lastSocialTime) < 60000;
        const isFangateReferrer = !!(document.referrer && document.referrer.match(/(droploud|hypeddit|pumpyoursound)/i));
        const isFangateHash = window.location.hash.includes("fangate");
        if (isRecentSocial || isFangateReferrer || isFangateHash || window.opener !== null) {
            console.info("Fangate social tab detected (" + window.location.host + "). Auto-closing in 2 seconds...");
            setTimeout(function () {
                try { window.close(); } catch(e) {}
            }, 2000);
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

        const lastSocialTime = getStored("fangate_social_opened_time", 0);
        const isRecentSocial = (Date.now() - lastSocialTime) < 60000;
        const isFangateReferrer = !!(document.referrer && document.referrer.match(/(droploud|hypeddit|pumpyoursound)/i));
        if (isRecentSocial || isFangateReferrer || window.opener !== null || window.location.href.includes("flow_ctx=")) {
            setTimeout(function () {
                try { window.close(); } catch(e) {}
            }, 2500);
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
                } else {
                    setStored("fangate_social_opened_time", Date.now());
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

        const setCheckboxChecked = function (cb, checked = true) {
            if (!cb) return;
            if (cb.checked !== checked) {
                cb.click();
            }
            if (cb.checked !== checked) {
                const proto = window.HTMLInputElement.prototype;
                const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'checked')?.set;
                if (cb._valueTracker) {
                    cb._valueTracker.setValue(!checked);
                }
                if (nativeSetter) {
                    nativeSetter.call(cb, checked);
                } else {
                    cb.checked = checked;
                }
                cb.dispatchEvent(new Event('input', { bubbles: true }));
                cb.dispatchEvent(new Event('change', { bubbles: true }));
            }
        };

        let isHandlingDroploud = false;
        let lastDroploudRun = 0;
        let cachedDroploudScUrl = null;

        const handleDroploud = function () {
            const now = Date.now();
            if (isHandlingDroploud || now - lastDroploudRun < 400) return;
            isHandlingDroploud = true;
            lastDroploudRun = now;

            try {
                const activeContainer = document.querySelector('.dltg-stage, .ds-gate-card, .ds-gate-pane, .ds-panel, .dtr-stage, .dtr-card-pane, .dtr-track-info');

                // Track identification and session state management
                const trackIdMatch = window.location.pathname.match(/\/track\/([a-zA-Z0-9-]+)/);
                const currentTrackId = trackIdMatch ? trackIdMatch[1] : window.location.pathname;
                if (window.currentTrackId !== currentTrackId) {
                    window.currentTrackId = currentTrackId;
                    setStored("fangate_current_track_id", currentTrackId);
                    window.hasClickedFinalDownload = false;
                    window.lastOpenedScTrack = 0;
                    window.lastFreeDlClick = 0;
                    cachedDroploudScUrl = null;
                }

                // Extract SoundCloud track URL from page data or links
                const getDroploudScTrackUrl = () => {
                    if (cachedDroploudScUrl) return cachedDroploudScUrl;
                    try {
                        const scriptTags = document.querySelectorAll('script');
                        for (const s of scriptTags) {
                            const text = s.textContent || "";
                            if (text.includes("soundcloud_url")) {
                                const m = text.match(/soundcloud_url\\*["']?\s*:\s*\\*["']?(https?:[a-zA-Z0-9_\/.:-]+)/);
                                if (m) {
                                    cachedDroploudScUrl = m[1].replace(/\\/g, "");
                                    return cachedDroploudScUrl;
                                }
                            }
                        }
                    } catch(e) {}
                    const openBtn = Array.from(document.querySelectorAll('.dltg-stage button, .dltg-stage a, .ds-gate-pane button, .ds-gate-pane a, .dtr-stage button, .dtr-stage a, .dtr-card-pane button, .dtr-card-pane a')).find(btn => {
                        const txt = (btn.textContent || "").toLowerCase();
                        const href = (btn.getAttribute('href') || btn.href || "").toLowerCase();
                        return href.includes("soundcloud.com") || txt.includes("open track on soundcloud");
                    });
                    if (openBtn) {
                        const href = openBtn.getAttribute('href') || openBtn.href;
                        if (href && href.includes("soundcloud.com")) {
                            cachedDroploudScUrl = href;
                            return href;
                        }
                    }
                    const scLinks = Array.from(document.querySelectorAll('a[href*="soundcloud.com"]'));
                    for (const a of scLinks) {
                        try {
                            const u = new URL(a.href);
                            const parts = u.pathname.split('/').filter(Boolean);
                            if (parts.length >= 2 && !['connect', 'authorize', 'pages', 'terms', 'privacy'].includes(parts[0])) {
                                cachedDroploudScUrl = a.href;
                                return a.href;
                            }
                        } catch(e) {}
                    }
                    return null;
                };

                // 1. Initial "FREE DOWNLOAD" button (for legacy pages where gate has not started yet):
                const isGateActive = !!document.querySelector('.dltg-stage, .ds-gate-card, .ds-gate-pane, .dtr-card-pane-step, .dtr-social-wrap, .dtr-email-wrap, .dtr-card-check');
                if (!isGateActive) {
                    const freeDlBtn = Array.from(document.querySelectorAll('button')).find(btn => {
                        const txt = (btn.textContent || "").trim().toUpperCase();
                        return (txt.includes("FREE DOWNLOAD") || btn.classList.contains("dtr-card-cta")) &&
                               !txt.includes("PREPARING") && !btn.disabled;
                    });
                    if (freeDlBtn) {
                        if (!window.lastFreeDlClick || now - window.lastFreeDlClick > 1000) {
                            window.lastFreeDlClick = now;
                            console.info("Clicking FREE DOWNLOAD button (retrying until gate opens)...");
                            freeDlBtn.click();
                            try {
                                freeDlBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
                            } catch(e) {}
                        }
                        return;
                    }
                }

                // 2. Email step handling
                const emailInput = document.querySelector('input#dltg-email, .dltg-stage input[type="email"], .ds-gate-pane input[type="email"], .dtr-stage input[type="email"], input[type="email"]');
                if (emailInput && (!emailInput.value || !emailInput.dataset.typed)) {
                    emailInput.dataset.typed = "true";
                    console.info("Simulating typing for Droploud email");
                    simulateTyping(emailInput, window.hypedditSettings.email);
                }

                const consentCheckbox = document.querySelector('.dltg-stage input[type="checkbox"]:not(:checked), .ds-gate-pane input[type="checkbox"]:not(:checked), input[name="consent"]:not(:checked), input[type="checkbox"]:not(:checked)');
                if (consentCheckbox) {
                    console.info("Checking consent checkbox");
                    setCheckboxChecked(consentCheckbox, true);
                }

                const emailContinueBtn = Array.from(document.querySelectorAll('.dltg-stage button, .ds-gate-pane button, form button[type="submit"], .dtr-stage button, .dtr-card-pane button')).find(btn => {
                    const txt = (btn.textContent || "").trim().toLowerCase();
                    const isSubmit = btn.type === "submit" || btn.classList.contains("ds-gate-wide");
                    return (txt.includes("continue") || txt.includes("next") || (isSubmit && txt.includes("free download")));
                });
                if (emailInput && emailInput.value && emailContinueBtn) {
                    if (emailContinueBtn.disabled) {
                        emailInput.dispatchEvent(new Event('input', { bubbles: true }));
                        emailInput.dispatchEvent(new Event('change', { bubbles: true }));
                        if (consentCheckbox) setCheckboxChecked(consentCheckbox, true);
                    } else if (!window.lastEmailContinueClick || now - window.lastEmailContinueClick > 1500) {
                        window.lastEmailContinueClick = now;
                        console.info("Clicking email Continue/Submit button:", emailContinueBtn.textContent.trim());
                        emailContinueBtn.click();
                        try { emailContinueBtn.form?.requestSubmit(); } catch(err) {}
                        return;
                    }
                }

                // 3. Honor steps (Instagram, Droploud follow, Spotify, Twitter etc.)
                const honorList = document.querySelector('.ds-honor-list');
                if (honorList) {
                    const openBtns = Array.from(honorList.querySelectorAll('.ds-honor-row:not(.is-done) button, .ds-honor-row:not(.is-done) a')).filter(el => {
                        const txt = (el.textContent || "").trim().toLowerCase();
                        return (txt === "open" || txt === "open here" || el.querySelector('svg')) && !el.dataset.autoClicked;
                    });
                    openBtns.forEach(el => {
                        el.dataset.autoClicked = "true";
                        setStored("fangate_social_opened_time", Date.now());
                        console.info("Opening honor step link:", el.textContent.trim() || el.title);
                        try { el.click(); } catch(e) {}
                    });

                    const honorGoBtn = document.querySelector('button[data-honor-go], button.ds-solid[data-honor-go]') ||
                        Array.from(document.querySelectorAll('.ds-gate-card button, .ds-gate-pane button, .ds-panel button, .dltg-stage button')).find(btn => {
                            const txt = (btn.textContent || "").trim().toLowerCase();
                            return (txt.includes("i've done it") || txt.includes("i did it") || txt.includes("i'm done") || txt === "done") && !btn.disabled && !btn.classList.contains("ds-disabled");
                        });
                    if (honorGoBtn && !honorGoBtn.disabled && !honorGoBtn.classList.contains("ds-disabled")) {
                        if (!window.lastHonorGoClick || now - window.lastHonorGoClick > 1500) {
                            window.lastHonorGoClick = now;
                            console.info("Clicking I've done it button");
                            honorGoBtn.click();
                            return;
                        }
                    }
                }

                // 4. Social buttons strictly scoped to active card (legacy/fallback)
                if (activeContainer) {
                    const socialButtons = Array.from(activeContainer.querySelectorAll('button, a')).filter(el => {
                        const href = (el.getAttribute('href') || el.href || "").toLowerCase();
                        if (href.startsWith('/') || href.includes('droploud.com/creator') || href.includes('droploud.com/u/') || href.startsWith('mailto:')) return false;
                        const txt = (el.textContent || "").trim().toLowerCase();
                        if (txt.includes("open track on soundcloud") || txt.includes("reshare") || txt.includes("repost") || txt.includes("free download") || txt.includes("terms") || txt.includes("dmca") || txt.includes("privacy")) return false;

                        return (txt.includes("↗") || txt.includes("@") || href.includes("instagram.com") || href.includes("spotify.com") || href.includes("soundcloud.com")) &&
                            !el.dataset.autoClicked && !el.disabled;
                    });

                    socialButtons.forEach(el => {
                        el.dataset.autoClicked = "true";
                        setStored("fangate_social_opened_time", Date.now());
                        console.info("Triggering social link:", el.textContent.trim());
                        try { el.click(); } catch(e) {}
                    });

                    const confirmBtn = Array.from(activeContainer.querySelectorAll('button')).find(btn => {
                        const txt = (btn.textContent || "").trim().toLowerCase();
                        return (txt.includes("i've done it") || txt.includes("i did it") || txt.includes("i'm done") || txt.includes("done")) && !btn.disabled && !btn.classList.contains("ds-disabled");
                    });
                    if (confirmBtn) {
                        if (!window.lastConfirmClick || now - window.lastConfirmClick > 1500) {
                            window.lastConfirmClick = now;
                            console.info("Clicking confirm button:", confirmBtn.textContent.trim());
                            confirmBtn.click();
                            return;
                        }
                    }
                }

                // 5. SoundCloud step (with comment typing emulation and track repost handling)
                const commentInput = document.querySelector('#dltg-sc-comment, #dtr-sc-comment-input, input[name="comment"], textarea[name="comment"], textarea.ds-input, textarea[placeholder*="comment"], textarea');
                if (commentInput && !commentInput.dataset.typed) {
                    commentInput.dataset.typed = "true";
                    console.info("Simulating typing for comment input");
                    simulateTyping(commentInput, window.hypedditSettings.comment);
                }

                const connectScBtn = Array.from(document.querySelectorAll('button')).find(btn => {
                    const txt = (btn.textContent || "").trim().toLowerCase();
                    const isScBtn = btn.classList.contains("ds-sc-btn") ||
                                    txt.includes("connect with soundcloud") ||
                                    txt.includes("connect soundcloud") ||
                                    (txt.includes("connect with") && (btn.querySelector('svg, img') || txt.includes("soundcloud")));
                    return isScBtn && !btn.disabled;
                });
                if (connectScBtn) {
                    if (!window.lastConnectScClick || now - window.lastConnectScClick > 3000) {
                        window.lastConnectScClick = now;
                        console.info("Clicking Connect SoundCloud");
                        connectScBtn.click();
                        return;
                    }
                }

                // Proactive SoundCloud track reposting:
                // Ensure track is opened on SoundCloud and reposted to pass Droploud verification
                const repostKey = "repost_done_" + currentTrackId;
                const isTrackRepostDone = getStored(repostKey, false);
                const isScStep = !!document.querySelector('#dltg-sc-comment, .dltg-sc-start, .dltg-sc-rows, #dtr-sc-comment-input, .dtr-sc-copy, .dtr-sc-confirm, .dtr-repost-chip, .dtr-action-row');

                const openScTrackBtn = Array.from(document.querySelectorAll('button, a')).find(btn => {
                    const txt = (btn.textContent || "").trim().toLowerCase();
                    const href = (btn.getAttribute('href') || btn.href || "").toLowerCase();
                    const isScTrack = href.includes("soundcloud.com") && !href.includes("/connect") && !href.includes("/authorize");
                    const isReshareText = txt.includes("open track on soundcloud") ||
                                          txt.includes("open on soundcloud") ||
                                          txt.includes("tap repost") ||
                                          txt.includes("reshare") ||
                                          txt.includes("repost") ||
                                          txt.includes("share track");
                    return (isReshareText || isScTrack) &&
                           !txt.includes("verify") && !txt.includes("reposted") && !txt.includes("reshared") && !txt.includes("connect") && !btn.disabled;
                });

                if (openScTrackBtn) {
                    if (!window.lastOpenedScTrack || now - window.lastOpenedScTrack > 2000) {
                        window.lastOpenedScTrack = now;
                        const scTrackUrl = getDroploudScTrackUrl() || (openScTrackBtn.getAttribute('href') || openScTrackBtn.href || "");
                        if (scTrackUrl && scTrackUrl.includes("soundcloud.com")) {
                            setStored("fangate_repost_time", Date.now());
                            setStored("fangate_repost_track", scTrackUrl);
                            setStored("fangate_current_track_id", currentTrackId);

                            if (!isTrackRepostDone) {
                                console.info("Opening SoundCloud track for repost & like:", scTrackUrl);
                                const targetUrl = scTrackUrl.includes("#fangate_repost") ? scTrackUrl : scTrackUrl + "#fangate_repost";
                                if (typeof GM_openInTab !== "undefined") {
                                    GM_openInTab(targetUrl, { active: false, insert: true });
                                } else {
                                    window.open(targetUrl, "_blank");
                                }
                            }
                        }

                        console.info("Triggering Droploud Open track button to advance to Verify stage:", openScTrackBtn.textContent.trim());
                        openScTrackBtn.click();
                        try {
                            openScTrackBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
                        } catch(e) {}
                        return;
                    }
                } else if (isScStep && !isTrackRepostDone) {
                    if (!window.lastOpenedScTrack || now - window.lastOpenedScTrack > 3000) {
                        window.lastOpenedScTrack = now;
                        const scTrackUrl = getDroploudScTrackUrl();
                        if (scTrackUrl && scTrackUrl.includes("soundcloud.com")) {
                            setStored("fangate_repost_time", Date.now());
                            setStored("fangate_repost_track", scTrackUrl);
                            setStored("fangate_current_track_id", currentTrackId);
                            console.info("Proactively opening SoundCloud track for repost & like:", scTrackUrl);
                            const targetUrl = scTrackUrl.includes("#fangate_repost") ? scTrackUrl : scTrackUrl + "#fangate_repost";
                            if (typeof GM_openInTab !== "undefined") {
                                GM_openInTab(targetUrl, { active: false, insert: true });
                            } else {
                                window.open(targetUrl, "_blank");
                            }
                            return;
                        }
                    }
                }

                const verifyRepostBtn = Array.from(document.querySelectorAll('button')).find(btn => {
                    const txt = (btn.textContent || "").trim().toLowerCase();
                    return (txt === "verify" ||
                            txt === "verify again" ||
                            txt.includes("verify") ||
                            txt.includes("reposted") ||
                            txt.includes("reshared") ||
                            txt.includes("i've reposted") ||
                            txt.includes("i've reshared") ||
                            txt.includes("check repost") ||
                            txt.includes("i did both") ||
                            txt.includes("i liked it too")) && !btn.disabled && btn.getAttribute('aria-disabled') !== "true" && !btn.classList.contains("ds-disabled");
                });
                if (verifyRepostBtn) {
                    const interval = isTrackRepostDone ? 1500 : 3000;
                    if (!window.lastVerifyClick || now - window.lastVerifyClick > interval) {
                        window.lastVerifyClick = now;
                        console.info("Clicking Verify Repost:", verifyRepostBtn.textContent.trim());
                        verifyRepostBtn.click();
                        return;
                    }
                }

                const continueAnywayBtn = Array.from(document.querySelectorAll('button')).find(btn => {
                    const txt = (btn.textContent || "").trim().toLowerCase();
                    return (txt === "continue" || txt === "continue anyway" || txt.includes("continue anyway")) && !btn.disabled && btn.getAttribute('aria-disabled') !== "true" && !btn.classList.contains("ds-disabled");
                });
                if (continueAnywayBtn) {
                    if (!window.lastContinueAnywayClick || now - window.lastContinueAnywayClick > 2000) {
                        window.lastContinueAnywayClick = now;
                        console.info("Clicking Continue / Continue anyway");
                        continueAnywayBtn.click();
                        return;
                    }
                }

                // 6. Spotify step
                const connectSpotifyBtn = Array.from(document.querySelectorAll('button')).find(btn =>
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

                // 7. Generic Continue / Follow / Skip
                const generalContinueBtn = Array.from(document.querySelectorAll('button')).find(btn => {
                    const txt = (btn.textContent || "").trim().toLowerCase();
                    return (txt.includes("continue") || txt.includes("i'm done") || txt.includes("follow on droploud") || txt.includes("skip")) && !btn.disabled && !btn.dataset.autoClicked;
                });
                if (generalContinueBtn) {
                    generalContinueBtn.dataset.autoClicked = "true";
                    console.info("Clicking Droploud Continue/Skip/Follow step:", generalContinueBtn.textContent.trim());
                    generalContinueBtn.click();
                    return;
                }

                // 8. Final DOWNLOAD button when unlocked
                const finalDownloadBtn = Array.from(document.querySelectorAll('button, a')).find(btn => {
                    const txt = (btn.textContent || "").trim().toLowerCase();
                    const href = (btn.getAttribute('href') || "").toLowerCase();
                    const isUnlocked = !!document.querySelector('.ds-glyph.ds-up, #dltg-card-t, .dtr-card-check') &&
                                       document.body.textContent.toLowerCase().includes("download unlocked");
                    const isDlText = txt === "download" || txt === "download file" || txt.includes("download now") || (isUnlocked && txt === "download");
                    const isDlHref = href.includes("/api/download") || href.includes("r2.dev") || href.includes("drive.google");
                    return (isDlText || isDlHref) && !btn.disabled && !txt.includes("free download") && !txt.includes("starting your download") && !txt.includes("preparing");
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
            } finally {
                isHandlingDroploud = false;
            }
        };

        setInterval(handleDroploud, 500);
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
        const storedRepostTrack = getStored("fangate_repost_track", "");
        let isTargetTrack = false;
        try {
            if (storedRepostTrack) {
                const currentPath = window.location.pathname.replace(/\/$/, "").toLowerCase();
                const storedPath = (new URL(storedRepostTrack, window.location.origin)).pathname.replace(/\/$/, "").toLowerCase();
                isTargetTrack = (currentPath === storedPath);
            }
        } catch(e) {}
        const isRecentRepostRequest = (Date.now() - lastRepostTime) < 180000; // requested within last 3 minutes
        const shouldAutoRepost = isFangateHash || isFangateReferrer || isTargetTrack || isRecentRepostRequest;

        if (!shouldAutoRepost) return;

        console.info("SoundCloud track opened from fangate detected. Initiating auto-repost handler...");

        const findLikeButton = () => {
            const direct = document.querySelector('.soundActions button.sc-button-like, .soundActions .sc-button-like, button.sc-button-like, .sc-button-like');
            if (direct) return direct;
            const candidates = Array.from(document.querySelectorAll('.soundActions button, button.sc-button, button'));
            return candidates.find(btn => {
                if (btn.closest('.sc-ministats') || btn.closest('.listenEngagement') || btn.closest('.headerSearch') || btn.closest('.playControls') || btn.closest('.sidebar')) return false;
                const title = (btn.getAttribute('title') || '').toLowerCase();
                const aria = (btn.getAttribute('aria-label') || '').toLowerCase();
                const txt = (btn.textContent || '').trim().toLowerCase();
                if (/^\d+\s*likes?/.test(title) || /^\d+\s*likes?/.test(aria) || /^\d+$/.test(txt)) return false;
                return title === "like" || aria === "like" || txt === "like" || title.includes("like") || aria.includes("like");
            });
        };

        const findRepostButton = () => {
            const containerBtn = document.querySelector('.repostCaptionContainer button, .repostCaptionContainer [role="button"]');
            if (containerBtn) return containerBtn;

            const directBtn = document.querySelector('.soundActions button.sc-button-repost, .soundActions .sc-button-repost, button.sc-button-repost, .sc-button-repost');
            if (directBtn) return directBtn;

            const candidates = Array.from(document.querySelectorAll('.soundActions button, button.sc-button, button'));
            return candidates.find(btn => {
                if (btn.closest('.sc-ministats') || btn.closest('.listenEngagement') || btn.closest('.headerSearch') || btn.closest('.playControls') || btn.closest('.sidebar')) return false;
                const title = (btn.getAttribute('title') || '').toLowerCase();
                const aria = (btn.getAttribute('aria-label') || '').toLowerCase();
                const txt = (btn.textContent || '').trim().toLowerCase();
                if (/^\d+\s*reposts?/.test(title) || /^\d+\s*reposts?/.test(aria) || /^\d+$/.test(txt)) return false;
                return title.includes("repost") || aria.includes("repost") || txt === "repost" || txt === "reposted";
            });
        };

        const tryRepostTrack = () => {
            if (window.hasHandledScRepost) return;

            // Auto-like the track as well (fangates like Droploud verify both like and repost)
            const likeBtn = findLikeButton();
            if (likeBtn && !window.hasHandledScLike) {
                const isAlreadyLiked = likeBtn.classList.contains("sc-button-selected") ||
                                       (likeBtn.getAttribute('title') || '').toLowerCase().includes("unlike") ||
                                       (likeBtn.getAttribute('aria-label') || '').toLowerCase().includes("unlike") ||
                                       (likeBtn.getAttribute('title') || '').toLowerCase().includes("liked") ||
                                       (likeBtn.getAttribute('aria-label') || '').toLowerCase().includes("liked");
                if (!isAlreadyLiked) {
                    console.info("Clicking SoundCloud Like button:", likeBtn);
                    likeBtn.click();
                    try {
                        likeBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
                    } catch(e) {}
                }
                window.hasHandledScLike = true;
            }

            const repostBtn = findRepostButton();
            if (!repostBtn) return;

            const isAlreadyReposted = repostBtn.classList.contains("sc-button-selected") ||
                                      (repostBtn.getAttribute('title') || '').toLowerCase().includes("reposted") ||
                                      (repostBtn.getAttribute('title') || '').toLowerCase().includes("unpost") ||
                                      (repostBtn.getAttribute('title') || '').toLowerCase().includes("remove") ||
                                      (repostBtn.getAttribute('aria-label') || '').toLowerCase().includes("remove");

            const currentTrackId = getStored("fangate_current_track_id", "");

            if (isAlreadyReposted) {
                window.hasHandledScRepost = true;
                console.info("Track is already reposted on SoundCloud profile!");
                if (currentTrackId) setStored("repost_done_" + currentTrackId, true);
                setStored("fangate_repost_completed", Date.now());
                setStored("fangate_repost_time", 0);

                setTimeout(() => {
                    try { window.close(); } catch(e) {}
                }, 2000);
                return;
            }

            window.hasHandledScRepost = true;
            console.info("Clicking SoundCloud Repost button:", repostBtn);
            repostBtn.click();
            try {
                repostBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
            } catch(e) {}

            // If a caption modal or dropdown appears, confirm it
            setTimeout(() => {
                const modalConfirmBtn = document.querySelector('.repostCaptionContainer__dropdown button[type="submit"], .modal__content button.sc-button-cta, .modal__content button.sc-button-orange, button.repostDropdown__button');
                if (modalConfirmBtn) {
                    console.info("Confirming repost in caption modal/dropdown:", modalConfirmBtn);
                    modalConfirmBtn.click();
                }
            }, 300);

            if (currentTrackId) setStored("repost_done_" + currentTrackId, true);
            setStored("fangate_repost_completed", Date.now());
            setStored("fangate_repost_time", 0);

            // Give SoundCloud time to send the repost network request before closing the tab
            setTimeout(() => {
                try { window.close(); } catch(e) {}
            }, 3500);
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
            // If there's a SoundCloud repost link, open it with #fangate_repost so SoundCloud auto-reposts it
            const repostLink = container.querySelector('a[data-step="repost"], a[href*="soundcloud.com"][href*="repost"], a.sc-repost');
            if (repostLink && !container.dataset.repostTriggered) {
                container.dataset.repostTriggered = "true";
                const trackUrl = repostLink.href || repostLink.getAttribute("href");
                if (trackUrl && trackUrl.includes("soundcloud.com")) {
                    setStored("fangate_repost_time", Date.now());
                    setStored("fangate_repost_track", trackUrl);
                    console.info("Opening SoundCloud track for repost:", trackUrl);
                    try {
                        const parsed = new URL(trackUrl, window.location.href);
                        parsed.hash = "fangate_repost";
                        window.open(parsed.toString(), "_blank");
                    } catch(e) {
                        try { repostLink.click(); } catch(err) {}
                    }
                }
            }

            container
                .querySelectorAll("a")
                .forEach((accountItem) => {
                    accountItem.classList.remove("undone");
                    accountItem.classList.add("done");
                });

            const skipperChannel = document.getElementById(skipperId.replace("_next", "_channel"));
            if (skipperChannel) skipperChannel.click();

            const skipper = document.getElementById(skipperId);
            if (skipper) {
                const currentSlide = skipper.closest(".fangate-slider-content");
                if (!currentSlide || !currentSlide.classList.contains("move-left")) {
                    skipper.click();
                }
            }
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
        let email = window.hypedditSettings.email;
        const name = window.hypedditSettings.name;

        if (!email || email.includes("@example.com") || !email.includes("@")) {
            email = "musicfan99@gmail.com";
        }

        const nameInput = document.getElementById("email_name");
        if (nameInput) {
            nameInput.value = name;
            nameInput.setAttribute("value", name);
            nameInput.dispatchEvent(new Event("input", { bubbles: true }));
            nameInput.dispatchEvent(new Event("change", { bubbles: true }));
        }

        const emailInput = document.getElementById("email_address");
        if (emailInput) {
            emailInput.value = email;
            emailInput.setAttribute("value", email);
            emailInput.dispatchEvent(new Event("input", { bubbles: true }));
            emailInput.dispatchEvent(new Event("change", { bubbles: true }));
            emailInput.dispatchEvent(new Event("blur", { bubbles: true }));
        }

        const nextBtn = document.getElementById("email_to_downloads_next");
        if (nextBtn) {
            nextBtn.click();
        }
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

    if (window.location.host.includes("hypeddit.com")) {
        let prevStepContent = null;
        let lastHandledTime = 0;

        const processHypedditStep = () => {
            const stepContent = document.querySelector(
                ".fangate-slider-content:not(.move-left)"
            );
            if (!stepContent) return;

            const now = Date.now();
            if (stepContent === prevStepContent && now - lastHandledTime < 1500) {
                return;
            }

            const stepClassList = stepContent.classList;
            lastHandledTime = now;
            prevStepContent = stepContent;

            if (stepClassList.contains("sp|ig|email")) {
                window.handleMultiPortal();
            } else if (stepClassList.contains("email|sc")) {
                window.handleEmailSoundCloud();
            } else if (stepClassList.contains("sc|yt")) {
                window.handleSoundCloudYoutube();
            } else if (stepClassList.contains("dn")) {
                window.handleDonate();
            } else if (stepClassList.contains("sc")) {
                window.handleSoundCloud();
            } else if (stepClassList.contains("ig")) {
                window.handleInstagram();
            } else if (stepClassList.contains("dw")) {
                window.handleDownload();
            } else if (stepClassList.contains("yt")) {
                window.handleYoutube();
            } else if (stepClassList.contains("sp")) {
                window.handleSpotify();
            } else if (stepClassList.contains("email")) {
                window.handleEmail();
            } else if (stepClassList.contains("tk")) {
                window.handleTikTok();
            } else if (stepClassList.contains("fb")) {
                window.handleFacebook();
            } else if (stepClassList.contains("mc")) {
                window.handleMixcloud();
            } else if (stepClassList.contains("bc")) {
                window.handleBandCamp();
            }
        };

        const targetNode = document.getElementById("myCarousel");
        if (targetNode) {
            const config = { attributes: true, childList: true, subtree: true };
            const observer = new MutationObserver(() => {
                processHypedditStep();
            });
            observer.observe(targetNode, config);
        }

        // Active interval fallback so steps never get stuck even if mutations don't fire
        setInterval(processHypedditStep, 500);

        const _start = () => {
            const dlBtn = document.getElementById("downloadProcess");
            if (dlBtn) dlBtn.click();
            processHypedditStep();
        };

        window.setTimeout(_start, 800);
    }
})()