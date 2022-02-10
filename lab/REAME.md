# board-game-recs - lab

> Jupyter notebooks.

## Requirements

Python 3.9+.

## Get started

1. Download and extract [dataset](https://www.kaggle.com/jvanelteren/boardgamegeek-reviews) to `kaggle`.

2. Prepare python env.

```
python3 -m venv venv
source venv/bin/activate.fish
pip install -r requirements.txt

```

3. Run JupyterLab.

```
python -m ipykernel install --user --name=venv # Register virtual env
venv/bin/jupyter-lab
```

## Notebooks

- [Data analysis](data-analysis.ipynb)
- [Collaborative filtering model](model.ipynb)

## Resources

- [Dataset](https://www.kaggle.com/jvanelteren/boardgamegeek-reviews)
- [Collaborative filtering with fastai](https://docs.fast.ai/collab.html)
