FROM python:3.8-slim

# Download MyFilter from github
RUN  apt-get update \
  && apt-get install -y wget \
  && rm -rf /var/cache/apt \
  && apt-get clean
RUN cd /tmp && wget https://github.com/lmytime/MyFilter/archive/refs/tags/1.0.0.tar.gz \
    && tar -zxvf 1.0.0.tar.gz && mv MyFilter-1.0.0 /app && rm -rf /tmp/*.tar.gz

WORKDIR /app

# Install python packages
RUN python -m pip install --upgrade pip && pip install --no-cache-dir numpy pandas scipy tqdm requests flask flask_cors h5py

EXPOSE 9899
SHELL ["/bin/sh", "-c"]
CMD python /app/run.py