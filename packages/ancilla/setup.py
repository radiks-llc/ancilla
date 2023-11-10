from setuptools import find_packages, setup

packages = find_packages(exclude=["ancilla_tests*"])

print(packages)

setup(
    name="ancilla",
    version="0.0.2",
    author="Mitchell Hynes",
    author_email="me@mitchellhynes.com",
    license="Apache-2.0",
    description=("Some Inference Framework"),
    url="https://github.com/radiks-llc/ancilla",
    classifiers=[
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "License :: OSI Approved :: Apache Software License",
        "Operating System :: OS Independent",
    ],
    packages=packages,
    include_package_data=True,
    install_requires=[],
    extras_require={
        "test": [
            "pytest",
        ],
    },
)
