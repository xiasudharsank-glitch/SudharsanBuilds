# 🎨 How to Change Fonts - Super Easy Guide

## Current Professional Fonts
- **Body Text**: Inter (paragraphs, descriptions, all regular text)
- **Headings**: Poppins (h1, h2, h3, titles, section headers)
- **Code/Monospace**: JetBrains Mono (optional, for code snippets)

---

## ✅ How to Change Fonts (3 Simple Steps)

### Step 1: Choose Your Fonts
Go to **[Google Fonts](https://fonts.google.com)** and select your fonts:

**Popular Professional Fonts:**
- **Modern & Clean**: Inter, Manrope, DM Sans, Plus Jakarta Sans
- **Professional & Friendly**: Poppins, Nunito, Outfit, Sora
- **Corporate**: Montserrat, Raleway, Roboto, Open Sans
- **Creative**: Space Grotesk, Quicksand, Comfortaa

### Step 2: Copy the Import Link
1. Click "View selected families" (top right)
2. Select font weights you need (400, 500, 600, 700, 800, 900)
3. Copy the `@import` code

### Step 3: Update Your Website
Open `src/index.css` and:

1. **Replace line 19** with your new `@import` link
2. **Update lines 22-24** with your font names

```css
/* Line 19: Replace this */
@import url('https://fonts.googleapis.com/css2?family=YOUR_FONT&display=swap');

/* Lines 22-24: Replace font names */
:root {
  --font-body: 'Your Body Font', sans-serif;
  --font-heading: 'Your Heading Font', sans-serif;
  --font-mono: 'Your Code Font', monospace;
}
```

**That's it!** The entire website will update automatically. 🎉

---

## 📋 Example Font Combinations

### Modern Tech Company
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Inter:wght@700;800;900&display=swap');

:root {
  --font-body: 'Inter', sans-serif;
  --font-heading: 'Inter', sans-serif;
}
```

### Creative & Friendly
```css
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Poppins:wght@600;700;800&display=swap');

:root {
  --font-body: 'DM Sans', sans-serif;
  --font-heading: 'Poppins', sans-serif;
}
```

### Corporate Professional
```css
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;600;700&family=Montserrat:wght@600;700;800&display=swap');

:root {
  --font-body: 'Roboto', sans-serif;
  --font-heading: 'Montserrat', sans-serif;
}
```

### Startup/SaaS Style
```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Manrope:wght@700;800&display=swap');

:root {
  --font-body: 'Plus Jakarta Sans', sans-serif;
  --font-heading: 'Manrope', sans-serif;
}
```

---

## 🎯 Tips for Choosing Fonts

1. **Keep it simple** - Use 2 fonts max (body + heading)
2. **Ensure readability** - Test on mobile devices
3. **Choose complementary pairs** - Google Fonts suggests pairings
4. **Check loading speed** - Don't select too many font weights
5. **Test across devices** - Fonts look different on mobile vs desktop

---

## 🚀 Font Weights Guide

- **300**: Light (rarely used)
- **400**: Regular/Normal (body text)
- **500**: Medium (emphasis)
- **600**: Semi-Bold (sub-headings)
- **700**: Bold (headings)
- **800**: Extra Bold (big titles)
- **900**: Black (rarely used)

**Recommendation**: Use weights 400, 500, 600, 700, 800 for best results.

---

## 📱 Mobile Font Optimization

The website automatically optimizes fonts for mobile:
- Minimum 16px font size on inputs (prevents iOS zoom)
- Responsive font sizing using `clamp()`
- Better rendering with `-webkit-font-smoothing`
- Safe area insets for notched devices

All mobile optimizations work automatically - no extra configuration needed!

---

## 🆘 Need Help?

1. **Fonts not loading?** - Check if Google Fonts link is correct
2. **Fonts look weird?** - Try clearing browser cache (Ctrl + Shift + R)
3. **Want to test locally?** - Run `npm run dev` and check in browser

---

## 📍 File Locations

- **Font Configuration**: `src/index.css` (lines 19-28)
- **Tailwind Font Setup**: `tailwind.config.js` (lines 18-22)

**Only edit `src/index.css` - the rest updates automatically!**
