# Adds a 13oz / 18oz material choice to the Backdrop Vinyl Banner (18oz = 1.8x the 13oz base, same rule as
# the regular vinyl banners). usage: python3 patch_backdrop.py in.html in.js out.html out.js
import sys
hin,jin,hout,jout=sys.argv[1:5]
html=open(hin,encoding='utf-8').read(); js=open(jin,encoding='utf-8').read()
def rep(s,o,n):
    assert s.count(o)==1,(o[:70],s.count(o)); return s.replace(o,n)

# 1. material dropdown above the size picker
html=rep(html,'''<div class="form-group"><label>Select Size (feet)</label>
          <select id="backdrop-size"''','''<div class="form-group"><label>Material</label>
          <select id="backdrop-material" onchange="calcBackdrop()"><option value="13oz">13oz Vinyl — Standard</option><option value="18oz">18oz Heavy-Duty Vinyl (+80%)</option></select></div>
        <div class="form-group"><label>Select Size (feet)</label>
          <select id="backdrop-size"''')
# 2. material in the cart/order text (both the add-to-cart text and the designer hand-off text)
old="onclick=\"requireDesign('Backdrop Vinyl Banner','backdrop-price',()=>document.getElementById('backdrop-size').options[document.getElementById('backdrop-size').selectedIndex].text+' · '+document.getElementById('backdrop-finish')"
new="onclick=\"requireDesign('Backdrop Vinyl Banner','backdrop-price',()=>document.getElementById('backdrop-size').options[document.getElementById('backdrop-size').selectedIndex].text+' · '+document.getElementById('backdrop-material').value+' Vinyl · '+document.getElementById('backdrop-finish')"
html=rep(html,old,new)
old2="document.getElementById('backdrop-size')?.options[document.getElementById('backdrop-size')?.selectedIndex]?.text+' · Qty: '+document.getElementById('backdrop-qty')?.value))\">"
new2="document.getElementById('backdrop-size')?.options[document.getElementById('backdrop-size')?.selectedIndex]?.text+' · '+document.getElementById('backdrop-material')?.value+' Vinyl · Qty: '+document.getElementById('backdrop-qty')?.value))\">"
html=rep(html,old2,new2)
html=rep(html,"Large format, seamless 13oz vinyl","Large format, seamless 13oz or 18oz heavy-duty vinyl")

# 3. price
oldc="const u=getUrgentMult('page-banner-backdrop');document.getElementById('backdrop-price').textContent='$'+((s*4+e)*q*u+getSatFee('page-banner-backdrop')).toFixed(2);"
newc="const u=getUrgentMult('page-banner-backdrop');const mEl=document.getElementById('backdrop-material');const mm=(mEl&&mEl.value==='18oz')?1.8:1;document.getElementById('backdrop-price').textContent='$'+((s*4*mm+e)*q*u+getSatFee('page-banner-backdrop')).toFixed(2);"
js=rep(js,oldc,newc)
open(hout,'w',encoding='utf-8').write(html); open(jout,'w',encoding='utf-8').write(js)
print('ok')
