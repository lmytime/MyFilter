FROM python:3.8-slim
WORKDIR /app

# Clone MyFilter from github
RUN apt update && apt intall -y wget && cd tmp \
    && wget https://github.com/lmytime/MyFilter/archive/refs/tags/0.0.2.tar.gz \
    && tar -zxvf 0.0.2.tar.gz
RUN cd /tmp && tar -zxvf 0.0.2.tar.gz && mv 0.0.2/* /app && rm -rf 0.0.2

# Install python packages
RUN python -m pip install --upgrade pip && pip install --no-cache-dir numpy pandas scipy tqdm requests flask flask_cors h5py

EXPOSE 9899
SHELL ["/bin/sh", "-c"]
CMD python /app/run.py