from pathlib import Path
import shutil
root=Path(__file__).resolve().parent
shutil.copytree(root/'public',root/'build',dirs_exist_ok=True)
print('Static production build complete.')
