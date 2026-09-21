from pathlib import Path
from PIL import Image, ImageOps
import sys
source=Path(sys.argv[1]).resolve()
target=Path(__file__).resolve().parents[1]/'products'
count=0
for folder in sorted(source.iterdir()):
    if not folder.is_dir() or folder.name.startswith('.') or folder.name=='catalog-site': continue
    for file in sorted(folder.rglob('*')):
        if file.suffix.lower() not in ['.jpg','.jpeg','.png']: continue
        relative=file.relative_to(folder).with_suffix('.webp')
        siblings=[p for p in file.parent.iterdir() if p.stem==file.stem and p.suffix.lower() in ['.jpg','.jpeg','.png']]
        if len(siblings)>1 and file.suffix.lower()!='.jpg': relative=file.relative_to(folder).with_name(file.name+'.webp')
        output=target/folder.name/relative
        if output.exists():
            count+=1
            continue
        output.parent.mkdir(parents=True,exist_ok=True)
        with Image.open(file) as im:
            im=ImageOps.exif_transpose(im)
            im.thumbnail((1600,1600))
            if im.mode not in ['RGB','RGBA']: im=im.convert('RGB')
            im.save(output,'WEBP',quality=85,method=4)
        count+=1
print(f'Imported {count} images')
