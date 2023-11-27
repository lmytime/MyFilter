FROM python:3.8-slim
WORKDIR /app
# Clone MyFilter from github
RUN apk add git && cd tmp \
    && wget https://github.com/lmytime/MyFilter/archive/refs/tags/0.0.1.tar.gz \
    && tar -zxvf 0.0.1.tar.gz -C /app
COPY ./MyFilter-0.0.1.tar.gz /tmp
RUN cd /tmp && tar -zxvf MyFilter-0.0.1.tar.gz && mv MyFilter-0.0.1/* /app && rm -rf MyFilter-0.0.1

# Install python packages
RUN python -m pip install --upgrade pip && pip install --no-cache-dir numpy pandas scipy tqdm requests flask flask_cors h5py \
    -i https://pypi.tuna.tsinghua.edu.cn/simple
# RUN apk add py-numpy
EXPOSE 9899
SHELL ["/bin/sh", "-c"]
CMD python /app/run.py